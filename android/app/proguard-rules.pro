# Add project specific ProGuard rules here.
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# react-native-reanimated (New Architecture)
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# React Native New Architecture
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.intl.** { *; }

# Keep native methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keepclassmembers,includedescriptorclasses class * { native <methods>; }

# expo-modules
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# Sentry
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**
