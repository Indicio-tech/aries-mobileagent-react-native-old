package com.ariesmobileagentreactnative;

import java.util.concurrent.ExecutionException;
import java.util.Arrays;
import java.nio.charset.Charset;
import java.io.File;
import java.io.FileWriter;

import android.os.Environment;
import android.os.AsyncTask;
import android.util.Log;
import android.util.TimingLogger;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.google.gson.Gson;

import org.hyperledger.indy.sdk.anoncreds.Anoncreds;
import org.hyperledger.indy.sdk.anoncreds.AnoncredsResults;
import org.hyperledger.indy.sdk.anoncreds.CredentialsSearch;
import org.hyperledger.indy.sdk.anoncreds.CredentialsSearchForProofReq;
import org.hyperledger.indy.sdk.crypto.Crypto;
import org.hyperledger.indy.sdk.did.Did;
import org.hyperledger.indy.sdk.did.DidResults;
import org.hyperledger.indy.sdk.non_secrets.WalletRecord;
import org.hyperledger.indy.sdk.non_secrets.WalletSearch;
import org.hyperledger.indy.sdk.wallet.Wallet;
import org.hyperledger.indy.sdk.IndyException;

import org.hyperledger.indy.sdk.ledger.Ledger;
import org.hyperledger.indy.sdk.ledger.LedgerResults;
import org.hyperledger.indy.sdk.pool.Pool;
import org.hyperledger.indy.sdk.pool.PoolJSONParameters;


public class IndyModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
	private static String TAG = "IndyInterface";
  private static Wallet wallet;
  private static Pool pool;

  private static ReactApplicationContext reactContext;

  public IndyModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    reactContext.addLifecycleEventListener(this);
  }

  @Override
  public String getName() {
    return "Indy";
  }

  @Override
  public void onHostResume() {
    // Activity `onResume`
    Log.d(TAG, "Lifecycle - onHostResume");
  }

  @Override
  public void onHostPause() {
    // Activity `onPause`
    Log.d(TAG, "Lifecycle - onHostPause");
  }

  @Override
  public void onHostDestroy() {
    // Activity `onDestroy`
    Log.d(TAG, "Lifecycle - onHostDestroyed");
    TimingLogger timing = new TimingLogger(TAG, "onHostDestroyed");

    try {
      Log.d(TAG, "Closing Wallet Handle");
      wallet.closeWallet().get();
      timing.addSplit("Closed Wallet Handle");

      Log.d(TAG, "Closing Pool Handle");
      pool.closePoolLedger().get();
      timing.addSplit("Closed Pool Handle");
    } catch (Exception e) {
      //TODO(JamesKEbert): Add logging vs error throwing
      Log.e(TAG, "Error Closing Pool and Wallet Handles", e);
    }
    finally{
      timing.dumpToLog();
      Log.d(TAG, "Lifecycle - Destroyed handles");
    }
  }


  @ReactMethod
  public void createWallet(String walletConfigJson, String walletCredentialsJson, Promise promise) {
    Log.i(TAG,"Creating wallet");
    
    try {
      Wallet.createWallet(walletConfigJson.toString(), walletCredentialsJson.toString()).get();
      promise.resolve(null);
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void deleteWallet(String walletConfigJson, String walletCredentialsJson, Promise promise){
    Log.i(TAG,"--------Deleting wallet--------");
    try {
      Wallet.deleteWallet(walletConfigJson.toString(), walletCredentialsJson.toString()).get();
      promise.resolve(null);
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void checkWallet(String walletConfigJson, String walletCredentialsJson, Promise promise){
    try{
      openWallet(walletConfigJson, walletCredentialsJson);
      promise.resolve(null);
    } 
    catch (Exception e) {
      Log.d(TAG, "Error Checking Wallet");
      promise.reject(e);
    }
  }

  //Open Wallet handle with specified config and credentials if wallet handle not already opened
  private Wallet openWallet(String walletConfigJson, String walletCredentialsJson) {    
    if(wallet == null){
      Log.d(TAG, "Wallet is null");
      try {
        wallet = Wallet.openWallet(walletConfigJson.toString(), walletCredentialsJson.toString()).get();
        //Log.d(TAG, String.valueOf(wallet.getWalletHandle()));
      } catch (Exception e) {
        //TODO(JamesKEbert): Add logging vs error throwing
        Log.e(TAG, "Error Closing Wallet", e);
        throw e;
      } finally {
        return wallet;
      }
    }
    else{
      Log.d(TAG, "Wallet Not null");
      return wallet;
    }
  }


  @ReactMethod
  public void checkPool(String configName, String config, Promise promise){
    try{
      openPool(configName, config);
      promise.resolve(null);
    } 
    catch (Exception e) {
      Log.d(TAG, "Error Checking Pool");
      promise.reject(e);
    }
  }

  private Pool openPool(String configName, String config){
    TimingLogger timing = new TimingLogger(TAG, "Opening Pool Handle");
    
    if(pool == null){
      try{
        Log.d(TAG, "Opening Ledger Pool");

        Log.d(TAG, "Pool Config:");
        Log.d(TAG, config);
        Log.d(TAG, configName);
        //Open Pool Connection
        pool = Pool.openPoolLedger(configName, config).get();
      }
      catch (Exception e) {
        //TODO(JamesKEbert): Add logging vs error throwing
        Log.d(TAG, "Error Opening Ledger Pool");
        throw e;
      } 
      finally{
        timing.dumpToLog();
        return pool;
      }
    }
    else{
      Log.d(TAG, "Pool Not null");
      timing.dumpToLog();
      return pool;
    }
  }

  @ReactMethod
  public void createAndStoreMyDid(String walletConfigJson, String walletCredentialsJson, String didJson, Promise promise){
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        DidResults.CreateAndStoreMyDidResult didResult = Did.createAndStoreMyDid(wallet, didJson.toString()).get();


        //TODO(JamesKEbert): Potentially break out object --> JSON  function if needed
        String did = didResult.getDid();
        String verkey = didResult.getVerkey();

        WritableMap map = new WritableNativeMap();

        map.putString("key", verkey);
        map.putString("did", did);

        promise.resolve(map);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void storeTheirDid(String walletConfigJson, String walletCredentialsJson, String didJson, Promise promise){
      Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        Did.storeTheirDid(wallet, didJson.toString()).get();

        promise.resolve(null);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
        IndyExceptionDetail indyError = new IndyExceptionDetail(e);
        promise.reject(indyError.toJSON());
    }
  }


  @ReactMethod
  public void addRecord(String walletConfigJson, String walletCredentialsJson, String type, String id, String value, String tagsJson, Promise promise){
    TimingLogger timings = new TimingLogger(TAG, "Adding Record");
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      timings.addSplit("setup");
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      timings.addSplit("Wallet Opened");
      if(wallet != null){

        WalletRecord.add(wallet, type.toString(), id.toString(), value.toString(), tagsJson.toString()).get();
        timings.addSplit("Record Added");

        promise.resolve(null);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
      timings.addSplit("Error");
    } finally{
      timings.addSplit("Execution Completed");
      timings.dumpToLog();
    }
  }

  @ReactMethod
  public void addRecordTags(String walletConfigJson, String walletCredentialsJson, String type, String id, String tagsJson, Promise promise){
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        WalletRecord.addTags(wallet, type.toString(), id.toString(), tagsJson.toString()).get();

        promise.resolve(null);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
        IndyExceptionDetail indyError = new IndyExceptionDetail(e);
        promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void updateRecordTags(String walletConfigJson, String walletCredentialsJson, String type, String id, String tagsJson, Promise promise){
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        WalletRecord.updateTags(wallet, type.toString(), id.toString(), tagsJson.toString()).get();

        promise.resolve(null);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void getRecord(String walletConfigJson, String walletCredentialsJson, String type, String id, String optionsJson, Promise promise){
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        String record = WalletRecord.get(wallet, type.toString(), id.toString(), optionsJson.toString()).get();

        promise.resolve(record);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void updateRecord(String walletConfigJson, String walletCredentialsJson, String type, String id, String value, Promise promise){
    Wallet wallet = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        WalletRecord.updateValue(wallet, type.toString(), id.toString(), value.toString()).get();

        promise.resolve(null);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void searchFetchNextRecords(String walletConfigJson, String walletCredentialsJson, String type, String queryJson, String optionsJson, int count, Promise promise){
    Wallet wallet = null;
    WalletSearch walletSearch = null;
    try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        //Open Search Handle
        walletSearch = openSearch(wallet, type, queryJson, optionsJson);
        if(walletSearch != null){
          String records = WalletSearch.searchFetchNextRecords(wallet, walletSearch, count).get();

          promise.resolve(records);
        }
        else {
          promise.reject("Unable to open wallet search handle");
        }
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      promise.reject(indyError.toJSON());
    } finally{
      if(walletSearch != null){
        //Close Wallet Handle
        closeSearch(walletSearch);
      }
    }
  }
  
  //Open wallet search handle
  private WalletSearch openSearch(Wallet wallet, String type, String queryJson, String optionsJson){
    WalletSearch walletSearch = null;
    try {
      walletSearch = WalletSearch.open(wallet, type.toString(), queryJson.toString(), optionsJson.toString()).get();
    } catch (Exception e) {
      Log.w("Unable to open Wallet Search Handle", e);
    } finally {
      return walletSearch;
    }
  }

  //Close opened wallet search handle
  private void closeSearch(WalletSearch walletSearch) {
    try {
      WalletSearch.closeSearch(walletSearch).get();
    } catch (Exception e) {
      //TODO(JamesKEbert): Add logging vs error throwing
      e.printStackTrace();
    }
  }



  @ReactMethod
  public void packMessage(String walletConfigJson, String walletCredentialsJson, ReadableArray recipientVerkeys, String senderVerkey, String message, Promise promise){
    Wallet wallet = null;
  try {
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        Log.d(TAG,"Packing Message");
        //Log.d(TAG, message.toString());
        //Log.d(TAG, recipientVerkeys.toString());
        byte[] by = message.getBytes();
        //TODO: abstract into higher up the array to JSON string
        String[] keys = new String[recipientVerkeys.size()];
        for (int i = 0; i < recipientVerkeys.size(); i++) {
            keys[i] = recipientVerkeys.getString(i);
        }
        Gson gson = new Gson();
        String receiverKeysJson = gson.toJson(keys);

        Log.d(TAG, keys.toString());

        byte[] jwe = Crypto.packMessage(wallet, /*recipientVerkeys*/receiverKeysJson.toString(), senderVerkey.toString(), by).get();

        /*Charset charset = Charset.forName("UTF-8");
        String string = new String(jwe, charset);
        Log.d(TAG, string);*/

        WritableArray packedMessage = new WritableNativeArray();
        for (byte b : jwe) {
            packedMessage.pushInt(b);
        }

        promise.resolve(packedMessage);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Packaging Message", e);
      promise.reject(indyError.toJSON());
    }
  }


  @ReactMethod
  public void unpackMessage(String walletConfigJson, String walletCredentialsJson, String jwe, Promise promise){
    Wallet wallet = null;
    try{
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        Log.d(TAG,"Unpacking Message");

        byte[] jweBytes = jwe.getBytes();

        byte[] res = Crypto.unpackMessage(wallet, jweBytes).get();

        Charset charset = Charset.forName("UTF-8");
        String unpackedMessageString = new String(res, charset);
        //Log.d(TAG, string);

        promise.resolve(unpackedMessageString);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    }catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Packaging Message", e);
      promise.reject(indyError.toJSON());
    }
  }


  private byte[] readableArrayToBytes(ReadableArray array){
    int length = array.size();
    byte[] buf = new byte[length];
    
    for(int i = 0; i < length; i++){
        buf[i] = (byte) array.getInt(i);
    }

    return buf;
  }

  @ReactMethod
  public void cryptoSign(String walletConfigJson, String walletCredentialsJson, String signerVerkey, ReadableArray dataToBeSigned, Promise promise){
    Wallet wallet = null;
    try{
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        Log.d(TAG,"Signing Data");
        byte[] dataToSign = readableArrayToBytes(dataToBeSigned);

        byte[] result = Crypto.cryptoSign(wallet, signerVerkey, dataToSign).get();

        Log.d(TAG,"Data Signed");


        WritableArray signedDataString = new WritableNativeArray();
        for (byte b : result) {
          signedDataString.pushInt(b);
        }

        promise.resolve(signedDataString);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Signing Data", e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void cryptoVerify(String signerVerkey, ReadableArray signedData, ReadableArray signature, Promise promise){
    try{
      Log.d(TAG,"Verifying Message");

      byte[] signedDataBytes = readableArrayToBytes(signedData);
      byte[] sigBufBytes = readableArrayToBytes(signature);

      boolean valid = Crypto.cryptoVerify(signerVerkey, signedDataBytes, sigBufBytes).get();

      promise.resolve(valid);
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Verifying Message", e);
      promise.reject(indyError.toJSON());
    }
  }



  //Ledger & Pool Related

  @ReactMethod
  public void createMasterSecret(String walletConfigJson, String walletCredentialsJson, String optionalMasterSecretId, Promise promise){
    Wallet wallet = null;
    try{
      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        Log.d(TAG,"Creating Master Secret");

        String masterSecretId = Anoncreds.proverCreateMasterSecret(wallet, optionalMasterSecretId).get();

        promise.resolve(masterSecretId);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);

      Log.e(TAG, "Error Creating Master Secret", e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void createPoolLedgerConfig(String configName, String poolConfig, Promise promise) {
    new CreatePoolLedgerConfig().execute(configName,poolConfig,promise);
  }

  private class CreatePoolLedgerConfig extends AsyncTask {
    Promise promise= null;

    @Override
    protected Object doInBackground(Object[] objects) {
      try {
        promise = (Promise) objects[2];



        Pool.setProtocolVersion(2).get();

        String configString = objects[1].toString();

        Log.d(TAG, configString);
        File file = new File(Environment.getExternalStorageDirectory() + "/" + File.separator + objects[0].toString() + ".txn");

        file.createNewFile();
        Log.d(TAG, file.getAbsolutePath());


        FileWriter fw = null;
        try {
          fw = new FileWriter(file, false);

          fw.write(configString);
        } catch (Exception e) {
          IndyExceptionDetail indyError = new IndyExceptionDetail(e);
          Log.w(TAG, "Error Writing Pool Ledger Config", e);
          promise.reject(indyError.toJSON());
        } finally {
          if ( fw != null ) {
            fw.close();
          }
        }

        PoolJSONParameters.CreatePoolLedgerConfigJSONParameter createPoolLedgerConfigJSONParameter
                = new PoolJSONParameters.CreatePoolLedgerConfigJSONParameter(file.getAbsolutePath());
        String stringPoolConfigJSON = createPoolLedgerConfigJSONParameter.toJson();
        Log.d(TAG, stringPoolConfigJSON);
        Pool.createPoolLedgerConfig(objects[0].toString(), stringPoolConfigJSON).get();

        promise.resolve(null);
      } catch (Exception e) {
        IndyExceptionDetail indyError = new IndyExceptionDetail(e);
        Log.w(TAG, "Error Creating Pool Ledger Config", e);
        promise.reject(indyError.toJSON());
      }
      return promise;
    }

    @Override
    protected void onPreExecute() {
      super.onPreExecute();
    }
  }


  @ReactMethod
  public void deletePoolLedgerConfig(String configName, Promise promise) {
    try{
      Log.d(TAG, "Deleting Pool Ledger Config");

      
      Pool.deletePoolLedgerConfig(configName.toString()).get();

      promise.resolve(null);
        
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Deleting Pool Ledger Config", e);
      promise.reject(indyError.toJSON());
    } 
  }

  @ReactMethod
  public void getSchema(String configName, String config, String submitterDID, String id, Promise promise){
    TimingLogger timings = new TimingLogger(TAG, "Getting Schema");
    Pool pool = null;
    try{
      Log.d(TAG,"Getting Schema by ID");

      Log.d(TAG,"Creating request JSON");
      String request = Ledger.buildGetSchemaRequest(submitterDID, id.toString()).get();
      timings.addSplit("Request Created");

      pool = openPool(configName.toString(), config.toString());
      if(pool != null){
        timings.addSplit("Pool Opened");
        Log.d(TAG, "Submitting request to ledger");

        String response = Ledger.submitRequest(pool, request).get();
        timings.addSplit("Request Submitted");

        Log.d(TAG, "Parsing Response");

        LedgerResults.ParseResponseResult schema = Ledger.parseGetSchemaResponse(response).get();
        timings.addSplit("Parsing Response");

        String schemaJSON = schema.getObjectJson();

        Log.d(TAG, "Finished getting schema");

        promise.resolve(schemaJSON);
        timings.addSplit("Returned Schema Result");
      }
      else {
        timings.addSplit("Pool Unable to be opened");
        promise.reject("Unable to open pool");
      }
    }
    catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Getting Schema from ledger", e);
      promise.reject(indyError.toJSON());
    } 
    finally{
      
      timings.addSplit("Execution Completed");
      timings.dumpToLog();
    }
  }

  @ReactMethod
  public void getCredDef(String configName, String config, String submitterDID, String id, Promise promise){
    Pool pool = null;
    try{
      Log.d(TAG,"Getting Cred Def by ID");

      Log.d(TAG,"Creating request JSON");
      String request = Ledger.buildGetCredDefRequest(submitterDID, id.toString()).get();

      pool = openPool(configName.toString(), config.toString());
      if(pool != null){
        Log.d(TAG, "Submitting request to ledger");

        String response = Ledger.submitRequest(pool, request).get();

        Log.d(TAG, "Parsing Response");

        LedgerResults.ParseResponseResult credDef = Ledger.parseGetCredDefResponse(response).get();

        String credDefJSON = credDef.getObjectJson();

        Log.d(TAG, "Finished getting cred def");

        promise.resolve(credDefJSON);
      }
      else {
        promise.reject("Unable to open pool");
      }
    }catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Getting Cred Def from ledger", e);
      promise.reject(indyError.toJSON());
      
    }
  }


  
  @ReactMethod
    public void proverCreateCredentialReq(String walletConfigJson, String walletCredentialsJson, String proverDid, String credentialOfferJson, String credentialDefJson, String masterSecretId, Promise promise){
    Wallet wallet = null;
    try{
      Log.d(TAG,"Creating Credential Request");

      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        AnoncredsResults.ProverCreateCredentialRequestResult result = Anoncreds.proverCreateCredentialReq(wallet, proverDid, credentialOfferJson, credentialDefJson, masterSecretId).get();

        String requestJson = result.getCredentialRequestJson();
        String credentialMetadata = result.getCredentialRequestMetadataJson();

        WritableMap credentialRequest = new WritableNativeMap();

        credentialRequest.putString("request", requestJson);
        credentialRequest.putString("metadata", credentialMetadata);

        Log.d(TAG, "Finished Creating Credential Request");

        promise.resolve(credentialRequest);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    }catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Creating Credential Request", e);
      promise.reject(indyError.toJSON());
    }
  }

  @ReactMethod
  public void proverStoreCredential(String walletConfigJson, String walletCredentialsJson, String credId, String credReqMetadataJson, String credJson, String credDefJson, String revRegDefJson, Promise promise){
    Wallet wallet = null;
    try{
      Log.d(TAG,"Storing Credential");

      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        String storedCredId = Anoncreds.proverStoreCredential(wallet, credId, credReqMetadataJson, credJson, credDefJson, revRegDefJson).get();

        Log.d(TAG, "Finished Storing Credential");

        promise.resolve(storedCredId);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    }catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Storing Credential", e);
      promise.reject(indyError.toJSON());
      
    }
  }

  @ReactMethod
  public void searchCreds(String walletConfigJson, String walletCredentialsJson, String queryJson, int count, Promise promise){
    Wallet wallet = null;

    try{
      Log.d(TAG,"Searching Credentials");

      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        CredentialsSearch credSearch = null;
        try{
          Log.d(TAG, "Opening Credential Search Handle");
          credSearch = CredentialsSearch.open(wallet, queryJson).get();
          if(credSearch != null){
            Log.d(TAG, "Opened Cred Search Handle");

            Log.d(TAG, "Searching by count");

            String result = credSearch.fetchNextCredentials(count).get();


            promise.resolve(result);
          }
          else {
            promise.reject("Unable to open credential search handle");
          }
        }
        finally {
          credSearch.closeSearch().get();
        }
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Getting Proof Credentials", e);
      promise.reject(indyError.toJSON());
      
    }
  }

  @ReactMethod
  public void getStoredCredsForProof(String walletConfigJson, String walletCredentialsJson, String proofReqJson, String extraQueryJson, ReadableArray attrReferentsToRetrieve, ReadableArray predReferentsToRetrieve, Promise promise){
    Wallet wallet = null;

    String[] attrReferents = new String[attrReferentsToRetrieve.size()];
    for (int i = 0; i < attrReferentsToRetrieve.size(); i++) {
      attrReferents[i] = attrReferentsToRetrieve.getString(i);
    }

    String[] predReferents = new String[predReferentsToRetrieve.size()];
    for (int i = 0; i < predReferentsToRetrieve.size(); i++) {
      predReferents[i] = predReferentsToRetrieve.getString(i);
    }

    try{
      Log.d(TAG,"Getting Presentation Proof Credentials");

      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){
        CredentialsSearchForProofReq credProofSearch = null;
        try{
          Log.d(TAG, "Opening Proof Search Handle");
          credProofSearch = CredentialsSearchForProofReq.open(wallet, proofReqJson, extraQueryJson).get();
          if(credProofSearch != null){
            Log.d(TAG, "Opened Proof Search Handle");

            Log.d(TAG, "Searching by referents");

            WritableMap credsResults = new WritableNativeMap();

            for (int i = 0; i < attrReferents.length; i++) {
              String result = credProofSearch.fetchNextCredentials(attrReferents[i], 100).get();
              credsResults.putString(attrReferents[i], result);
            }
            
            /*WritableMap attrCredsResults = new WritableNativeMap();
            WritableMap predCredsResults = new WritableNativeMap();

            for (int i = 0; i < referents.length; i++) {
              String result = credProofSearch.fetchNextCredentials(attrReferents[i], 100).get();
              attrCredsResults.putString(attrReferents[i], result);
            }
            
            for (int i = 0; i < referents.length; i++) {
              String result = credProofSearch.fetchNextCredentials(predReferents[i], 100).get();
              predCredsResults.putString(predReferents[i], result);
            }

            WritableMap credsResults = new WritableNativeMap();*/


            promise.resolve(credsResults);
          }
          else {
            promise.reject("Unable to open proof search handle");
          }
        }
        finally{
          credProofSearch.closeSearch().get();
        }
      }
      else {
        promise.reject("Unable to open wallet");
      }
    } catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Getting Proof Credentials", e);
      promise.reject(indyError.toJSON());
      
    }
  }

  @ReactMethod
  public void proverCreateProof(
    String walletConfigJson, 
    String walletCredentialsJson, 
    String proofRequest, 
    String requestedCredentials, 
    String masterSecret, 
    String schemas, 
    String credentialDefs, 
    String revStates, 
    Promise promise) {
    Wallet wallet = null;

    try{
      Log.d(TAG,"Creating Proof");
      /*Log.d(TAG,proofRequest);
      Log.d(TAG,requestedCredentials);
      Log.d(TAG,masterSecret);
      Log.d(TAG,schemas);
      Log.d(TAG,credentialDefs);
      Log.d(TAG,revStates);*/

      //Open Wallet Handle
      wallet = openWallet(walletConfigJson, walletCredentialsJson);
      if(wallet != null){

        String proof = Anoncreds.proverCreateProof(wallet, proofRequest.toString(), requestedCredentials.toString(), masterSecret.toString(), schemas.toString(), credentialDefs.toString(), revStates.toString()).get();

        Log.d(TAG, "Created Proof");
        Log.d(TAG, proof);

        promise.resolve(proof);
      }
      else {
        promise.reject("Unable to open wallet");
      }
    }catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Creating Proof", e);
      promise.reject(indyError.toJSON());
      
    }
  }

  @ReactMethod
  public void verifyProof(
    String proofRequest, 
    String proof, 
    String schemas, 
    String credentialDefs, 
    String revocRegDefs, 
    String revocRegs, 
    Promise promise) {

    try{
      Log.d(TAG,"Verifying Proof");
      Log.d(TAG, proofRequest);
      Log.d(TAG, proof);
      Log.d(TAG, schemas);
      Log.d(TAG, credentialDefs);
      Log.d(TAG, revocRegDefs);
      Log.d(TAG, revocRegs);

      Boolean verified = Anoncreds.verifierVerifyProof(proofRequest, proof, schemas, credentialDefs, revocRegDefs, revocRegs).get();

      Log.d(TAG, "Verified Proof");

      promise.resolve(verified);
    }
    catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Verifying Proof", e);
      promise.reject(indyError.toJSON());
    }
  }


  

  @ReactMethod
  public void generateNonce(Promise promise){
    try{
      Log.i(TAG, "Generating Nonce");
      //Generate Nonce
      String nonce = Anoncreds.generateNonce().get();
      promise.resolve(nonce);
    }
    catch (Exception e) {
      IndyExceptionDetail indyError = new IndyExceptionDetail(e);
      Log.e(TAG, "Error Generating Nonce", e);
      promise.reject(indyError.toJSON());
    } 
  }

  //Errors
  class IndyExceptionDetail {
    private String code;
    private String message;

    private IndyExceptionDetail(Throwable e) {
      String code = "0";

      if (e instanceof ExecutionException) {
        Throwable cause = e.getCause();

        if (cause instanceof IndyException) {
          IndyException indyException = (IndyException) cause;

          code = String.valueOf(indyException.getSdkErrorCode());
        }
      }

      this.code = code;
      this.message = e.getMessage();
    }

    public String getErrorCode() {
      return this.code;
    }

    public String toJSON() {
    	Gson gson = new Gson();

    	return gson.toJson(this);
    }
  }

}