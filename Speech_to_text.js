var requirejs = require('requirejs');
require(["Speech.Browser.Sdk"], function (SDK) {
    // Now start using the SDK
});
// Setup the recongizer
function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {
    var recognizerConfig = new SDK.RecognizerConfig(new SDK.SpeechConfig(new SDK.Context(new SDK.OS(navigator.userAgent, "Browser", null), new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))), recognitionMode, // SDK.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation)
    language, // Supported laguages are specific to each recognition mode. Refer to docs.
    format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)
    // Alternatively use SDK.CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) for token auth
    var authentication = new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);
    return SDK.Recognizer.Create(recognizerConfig, authentication);
}
function RecognizerStart(SDK, recognizer) {
    recognizer.Recognize(function (event) {
        /*
         Alternative syntax for typescript devs.
         if (event instanceof SDK.RecognitionTriggeredEvent)
         */
        switch (event.Name) {
            case "RecognitionTriggeredEvent":
                UpdateStatus("Initializing");
                break;
            case "ListeningStartedEvent":
                UpdateStatus("Listening");
                break;
            case "RecognitionStartedEvent":
                UpdateStatus("Listening_Recognizing");
                break;
            case "SpeechStartDetectedEvent":
                UpdateStatus("Listening_DetectedSpeech_Recognizing");
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechHypothesisEvent":
                UpdateRecognizedHypothesis(event.Result.Text);
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechEndDetectedEvent":
                OnSpeechEndDetected();
                UpdateStatus("Processing_Adding_Final_Touches");
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechSimplePhraseEvent":
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "SpeechDetailedPhraseEvent":
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "RecognitionEndedEvent":
                OnComplete();
                UpdateStatus("Idle");
                console.log(JSON.stringify(event)); // Debug information
                break;
        }
    })
        .On(function () {
        // The request succeeded. Nothing to do here.
    }, function (error) {
        console.error(error);
    });
}
function RecognizerStop(SDK, recognizer) {
    // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
    recognizer.AudioSource.TurnOff();
}
