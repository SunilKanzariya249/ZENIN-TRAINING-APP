package com.zenin.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "NativeStepCounter",
    permissions = {
        @Permission(
            strings = { Manifest.permission.ACTIVITY_RECOGNITION },
            alias = "activity"
        )
    }
)
public class StepCounterPlugin extends Plugin implements SensorEventListener {

    private static final String PREF_NAME = "zenin_native_step_data";
    private static final String KEY_BASELINE_DATE = "baseline_date";
    private static final String KEY_BASELINE_STEPS = "baseline_steps";
    private static final String KEY_LAST_STEPS = "last_hardware_steps";
    private static final String KEY_HISTORY_PREFIX = "history_";

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private float lastHardwareSteps = -1;
    private boolean isRegistered = false;

    @Override
    public void load() {
        super.load();
        initSensor();
    }

    private void initSensor() {
        try {
            Context context = getContext();
            if (context == null) return;

            sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
            if (sensorManager != null) {
                stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
                if (stepCounterSensor != null) {
                    sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_NORMAL);
                    isRegistered = true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getTodayDateStr() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        return sdf.format(new Date());
    }

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            float hardwareSteps = event.values[0];
            processHardwareStepReading(hardwareSteps);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    private synchronized void processHardwareStepReading(float hardwareSteps) {
        if (hardwareSteps < 0) return;

        SharedPreferences prefs = getPrefs();
        String today = getTodayDateStr();
        String savedDate = prefs.getString(KEY_BASELINE_DATE, "");
        float baselineSteps = prefs.getFloat(KEY_BASELINE_STEPS, -1);
        float prevLastSteps = prefs.getFloat(KEY_LAST_STEPS, -1);

        SharedPreferences.Editor editor = prefs.edit();

        // 1. Check if first time initialization
        if (savedDate.isEmpty() || baselineSteps < 0) {
            editor.putString(KEY_BASELINE_DATE, today);
            editor.putFloat(KEY_BASELINE_STEPS, hardwareSteps);
            editor.putFloat(KEY_LAST_STEPS, hardwareSteps);
            editor.putInt(KEY_HISTORY_PREFIX + today, 0);
            editor.apply();
            lastHardwareSteps = hardwareSteps;
            return;
        }

        // 2. Check for day rollover (e.g. user walked while app was closed yesterday)
        if (!savedDate.equals(today)) {
            // Archive previous day's steps
            int previousDaySteps = Math.max(0, Math.round(prevLastSteps - baselineSteps));
            editor.putInt(KEY_HISTORY_PREFIX + savedDate, previousDaySteps);

            // Reset baseline for new day
            editor.putString(KEY_BASELINE_DATE, today);
            editor.putFloat(KEY_BASELINE_STEPS, hardwareSteps);
            editor.putFloat(KEY_LAST_STEPS, hardwareSteps);
            editor.putInt(KEY_HISTORY_PREFIX + today, 0);
            editor.apply();
            lastHardwareSteps = hardwareSteps;
            return;
        }

        // 3. Check for device reboot during the day (hardware steps counter reset to 0)
        if (hardwareSteps < baselineSteps) {
            // Hardware reset happened, re-anchor baseline to 0
            editor.putFloat(KEY_BASELINE_STEPS, 0);
            baselineSteps = 0;
        }

        // 4. Update today's steps
        int todaySteps = Math.max(0, Math.round(hardwareSteps - baselineSteps));
        editor.putFloat(KEY_LAST_STEPS, hardwareSteps);
        editor.putInt(KEY_HISTORY_PREFIX + today, todaySteps);
        editor.apply();

        lastHardwareSteps = hardwareSteps;
    }

    @PluginMethod
    public void hasHardwareSensor(PluginCall call) {
        boolean hasSensor = stepCounterSensor != null;
        JSObject ret = new JSObject();
        ret.put("supported", hasSensor);
        ret.put("isListening", isRegistered);
        call.resolve(ret);
    }

    @PluginMethod
    public void getStepMetrics(PluginCall call) {
        try {
            if (stepCounterSensor == null) {
                initSensor();
            }

            SharedPreferences prefs = getPrefs();
            String today = getTodayDateStr();
            String savedDate = prefs.getString(KEY_BASELINE_DATE, today);
            float baselineSteps = prefs.getFloat(KEY_BASELINE_STEPS, 0);
            float lastSteps = prefs.getFloat(KEY_LAST_STEPS, 0);

            if (lastHardwareSteps > 0) {
                processHardwareStepReading(lastHardwareSteps);
            }

            int todaySteps = prefs.getInt(KEY_HISTORY_PREFIX + today, 0);

            JSObject ret = new JSObject();
            ret.put("todaySteps", todaySteps);
            ret.put("hardwareTotalSteps", Math.round(lastSteps));
            ret.put("baselineDate", savedDate);
            ret.put("hasHardwareSensor", stepCounterSensor != null);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to retrieve native step metrics: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getHistory(PluginCall call) {
        try {
            SharedPreferences prefs = getPrefs();
            Map<String, ?> allEntries = prefs.getAll();
            JSArray historyArray = new JSArray();

            for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
                if (entry.getKey().startsWith(KEY_HISTORY_PREFIX)) {
                    String date = entry.getKey().substring(KEY_HISTORY_PREFIX.length());
                    Object val = entry.getValue();
                    int steps = (val instanceof Integer) ? (Integer) val : 0;

                    JSObject item = new JSObject();
                    item.put("date", date);
                    item.put("steps", steps);
                    historyArray.put(item);
                }
            }

            JSObject ret = new JSObject();
            ret.put("history", historyArray);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to retrieve native step history: " + e.getMessage());
        }
    }

    @PluginMethod
    public void recordStepOffset(PluginCall call) {
        int added = call.getInt("steps", 0);
        if (added <= 0) {
            call.resolve();
            return;
        }

        SharedPreferences prefs = getPrefs();
        String today = getTodayDateStr();
        int current = prefs.getInt(KEY_HISTORY_PREFIX + today, 0);
        prefs.edit().putInt(KEY_HISTORY_PREFIX + today, current + added).apply();

        JSObject ret = new JSObject();
        ret.put("todaySteps", current + added);
        call.resolve(ret);
    }
}
