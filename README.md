# aries-mobileagent-react-native
Aries Mobile Agent React Native (AMA-RN) - An Aries Mobile Agent written to create an interface for managing SSI credentials, mediation, governance frameworks, and other Aries protocols and features. Currently built for Android with iOS support on the roadmap.

## App Requirements

AMA-RN is built on React Native 0.61.5. Newer versions of React Native expierience issues with ZMQ (Fatal Signal 6 (SIGABRT)). 

AMA-RN targets Android API 29.0.3, with plans to support API 30 soon. If you need to support Android 11 (API 30), you should add the following to your application tag in your AndroidManifest:
```
android:requestLegacyExternalStorage="true"
```

Currently AMA-RN does not support the x86_64 architecture, however this should be addressed soon. You can remove this from your Android build process by specifying in your build.gradle:
```
include "armeabi-v7a", "x86", "arm64-v8a"/*, "x86_64" */

...

def versionCodes = ["armeabi-v7a": 1, "x86": 2, "arm64-v8a": 3/*, "x86_64": 4*/]
```


## Setup

Either install a compiled package or use a git submodule for local development:

### Install
Within your local React Native app, run:
```
npm install aries-mobileagent-react-native
```

### Local Library Development
We suggest using git submodules for local development, due to known [metro symlink issues](https://github.com/facebook/metro/issues/1) that prevent the usage of local npm dependecies or `npm link`.

Within your local React Native app, run:
```
git submodules add https://github.com/Indicio-tech/aries-mobileagent-react-native
cd aries-mobileagent-react-native
```

Checkout the appropriate version or branch if not developing against main:
```
git checkout BRANCH_TO_CHECKOUT
```

Install AMA-RN Library Dependencies:
```
npm install
```

Install and autolink your local AMA-RN library in your App:
```
cd ..
npm install aries-mobileagent-react-native
```

You should now be able to develop your app and AMA-RN locally.


## Usage

Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) will work. Any changes made to native modules require you to re-run `react-native run-android`.


## Troubleshooting

#### Native Module Linking or Usage Issues

If you end up changes dependencies or structures, you may need to clean the app:
```
cd android
./gradlew clean
cd ..
```

Sometimes it's necessary to remove and reinstall your dependencies:
```
rm -rf node_modules
npm install
```

Clean the Metro cache:
```
react-native start --reset-cache
```
In your second terminal:
```
react-native run-android
```