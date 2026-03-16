package com.xamnes.avalonian_tools

import android.os.Bundle
import android.os.Build
import android.view.WindowManager
import android.graphics.Color
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
    private var backPressedTime: Long = 0
    private var backToast: Toast? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode = 
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        window.statusBarColor = Color.parseColor("#33000000")
        window.navigationBarColor = Color.parseColor("#33000000")

        WindowCompat.setDecorFitsSystemWindows(window, false)

        hideSystemUI()
        setupKeyboardResize() 
        setupDoubleBackToExit() 
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    private fun hideSystemUI() {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    private fun setupKeyboardResize() {
        val rootView = window.decorView.rootView
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, windowInsets ->
            val isKeyboardVisible = windowInsets.isVisible(WindowInsetsCompat.Type.ime())
            val keyboardHeight = windowInsets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            
            if (isKeyboardVisible) {
                view.setPadding(0, 0, 0, keyboardHeight)
            } else {
                view.setPadding(0, 0, 0, 0)
            }
            windowInsets
        }
    }

    private fun setupDoubleBackToExit() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (backPressedTime + 2000 > System.currentTimeMillis()) {
                    backToast?.cancel()
                    finish() 
                } else {
                    backToast = Toast.makeText(
                        baseContext, 
                        "Press back again to exit", 
                        Toast.LENGTH_SHORT
                    )
                    backToast?.show()
                }
                // Catat waktu pencetan pertama
                backPressedTime = System.currentTimeMillis()
            }
        })
    }
}