# Aries Mobile Agent React Native (AMA-RN)
Aries Mobile Agent React Native is an Aries Mobile Agent written to create an interface for managing SSI credentials, mediation, governance frameworks, and other Aries protocols and features. This project is intended to provide an accessible open source Aries agent within a React Native environment. Currently built for Android with iOS support in progress. 

Note: This project was developed in parallel to [this project](https://github.com/animo/aries-mobile-agent-react-native) at Animo. We intend to work with the community to address project naming conventions as the number of projects increases within the Aries community. 

### Coming Soon: Quick Start
A part of this project is the development of a sample app that can be used as a reference for AMA-RN usage as well as UI best practices. 
Head to the [AMARN-Sample-App repo](https://github.com/Indicio-tech/aries-mobileagent-react-native-sample-app) for instructions to get started running an agent quickly, including APKs to just walk through the app.

## Future Work / Roadmap

- [x] Modify and utilize [updated mediation capabilities](https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md) supported by ACA-Py (added v0.1.0).
- [ ] Basic Message Protocol Handling 
    - [x] Basic Message Protocol Handler (added v0.1.0)
    - [ ] Basic Message Service (estimated 2/16)
- [ ] Invitation Generation (estimated 2/11).
- [ ] Identify Dependency Injection / Plugin strategy
    - [ ] Circular dependencies
- [ ] Credential Issuance (estimated 2/12).
- [ ] Credential Presentation (estimated 2/12).
- [ ] Refactor AMA-RN indy-sdk usage (Utilize and support [rn-indy-sdk](https://github.com/AbsaOSS/rn-indy-sdk))
- [ ] Add iOS support.
- [ ] Contribute updates to bring React Native to version 0.63.x
- [ ] Access and consume machine readable governance frameworks.
- [ ] Modify storage mechanisms.
    - [ ] Investigate Indy non_secrets database replacement
- [ ] Return Route Decorator
- [ ] Out of Band (OOB) support.
    - [ ] did:key support.
    - [ ] DID Exchange support.
- [ ] Testing
    - [ ] Indy-SDK consumption tests
    - [ ] End-to-End tests
- [ ] Error Handling
    - [ ] Problem Reports
- [ ] Android API 30 Support
    - [ ] Android Storage changes with Indy-SDK

### Testing Frameworks:
AMA-RN plans to use the [Aries Protocols Test Suite (APTS)](https://github.com/hyperledger/aries-protocol-test-suite) and the [Aries Agent Test Harness (AATH)](https://github.com/hyperledger/aries-agent-test-harness) to test for Aries Agent compatibility and interoperability.

## App Requirements

AMA-RN currently is built on React Native 0.61.5. Newer versions of React Native experience issues with ZMQ (Fatal Signal 6 (SIGABRT)). We are making efforts to be able to move to React Native 0.63.4.

AMA-RN targets Android API 29.0.3, with plans to support API 30 soon. If you need to support Android 11 (API 30), you should add the following to your application tag in your AndroidManifest:
```
android:requestLegacyExternalStorage="true"
```

Currently AMA-RN does not support the x86_64 architecture, however this will be addressed very soon. You can remove this from your Android build process by specifying in your build.gradle:
```
include "armeabi-v7a", "x86", "arm64-v8a"

...

def versionCodes = ["armeabi-v7a": 1, "x86": 2, "arm64-v8a": 3]
```


## Install

Either install a compiled package or use a git submodule for local development:

### Install the Compiled Package
Within your React Native app, run with your target version:
```
npm install "git@github.com:Indicio-tech/aries-mobileagent-react-native.git#v0.x.x"
```

Install peer dependencies of AMA-RN:
```
npm install react-native-fs react-native-get-random-values
```

Add the following to `allprojects` in your React Native app's Android build.gradle:
```
maven { url 'https://repo.sovrin.org/repository/maven-public' }
```

### Install for Local Library Development
We suggest using git submodules for local development, due to known [metro symlink issues](https://github.com/facebook/metro/issues/1) that prevent the usage of local npm dependecies or `npm link`. You may be able to utilize a [custom metro configuration](https://github.com/facebook/metro/issues/447).

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

Install peer dependencies of AMA-RN:
```
npm install react-native-fs react-native-get-random-values
```

Add the following to `allprojects` in your React Native app build.gradle:
```
maven { url 'https://repo.sovrin.org/repository/maven-public' }
```

You should now be able to develop your app using AMA-RN locally.

## API Quickstart

Sample usage:

```
import AMARN from 'aries-mobileagent-react-native'

...

//Generate a master secret ID
const masterSecretID = await AMARN.generateMasterSecretID()

//Create a new agent
await AMARN.createAgent(
{
    walletName: "SampleWallet",
    walletPassword: "SamplePassword",
    masterSecretID: masterSecretID,
    ledgerConfig: {
        name: "Indicio-TestNet",
        genesisString: `GENESIS_STRING`
    },
    defaultMediatorConfig: {
        invite: "http://mediator2.test.indiciotech.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiZjRhYmIxZTUtNzEwNS00ODg1LTk1MDEtMWI4YWI0YzQ4MDRiIiwgImxhYmVsIjogIkluZGljaW8gUHVibGljIE1lZGlhdG9yIiwgInJlY2lwaWVudEtleXMiOiBbIjdXY1FReFg3MmFNc2tHeXIzWGZKNmJhNXhnZDVlN20yUENhTEdIekV2ZzljIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMi50ZXN0LmluZGljaW90ZWNoLmlvIn0=",
        mediatorID: "indicio-public-mediator
    },
})

...

//Open an existing agent
agent = await AMARN.loadAgent(
    "SampleWallet",
    "SamplePassword",
    masterSecretID
);
```

#### Additional Documentation

Additional documentation can be found in the [`docs folder`](https://github.com/Indicio-tech/aries-mobileagent-react-native/blob/main/docs/README.md)

## Troubleshooting

#### Hot Reloading
Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) will work. Any changes made to native modules require you to re-run `npx react-native run-android`.

#### Mediator ID Issues
There is a known issue that while in development that doesn't open a new wallet, which causes issues with the Mediator IDs. You can work around this issue by closing the app and reopening the app when refreshing changes. Fixes are in progress to address this.

#### Dependency Issues, Native Module Linking Issues, or Usage Issues
If you end up changing dependencies or structures, you may need to perform the following steps:

```
rm -rf node_modules
npm install
```

Clean the Android build:
```
cd android
./gradlew clean
cd ..
```

Clean the Metro cache:
```
npx react-native start --reset-cache
```

In your second terminal, you can now run:
```
npx react-native run-android
```

## License

[Apache License Version 2.0](https://github.com/Indicio-tech/aries-mobileagent-react-native/blob/main/license)