//HANDLERS
const Alexa = require(`ask-sdk-core`);
var AWS = require("aws-sdk");

const CollectQuestionIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `IntentRequest` &&
           handlerInput.requestEnvelope.request.intent.name === 'CollectQuestionIntent';
  },
  async handle(handlerInput) {
    let speechOutput;
    const sQuery = handlerInput.requestEnvelope.request.intent.slots.sQuery.value;
    
    // C L O U D S E A R C H
    var csd = new AWS.CloudSearchDomain({
          endpoint: 'doc-climate-102-hf2yaesjmwfzxt57jr6qs4p25e.us-east-1.cloudsearch.amazonaws.com',
          apiVersion: '2013-01-01'              
    });
    var params = {
        query: sQuery,
        sort: '_score desc',
        size: 2,
        start:0,
        queryOptions: JSON.stringify({fields: ['question']}),
    };
    
    var queryResult = "";
    
    await (csd.search(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      }
      else {
          if (!data.hits.hit[0]) {
            queryResult = "Sorry. I don't know the answer to that yet.";
          }
          else queryResult = JSON.stringify(data.hits.hit[0].fields.answer);
      }
    })).promise();
    // C L O U D S E A R C H
    speechOutput = queryResult;
    
    //FOR REPEAT
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const repeat = speechOutput;
    attributes.repeat = repeat;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt()
      .getResponse();    
  },
};

const CollectCourseIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `IntentRequest` &&
           handlerInput.requestEnvelope.request.intent.name === 'CollectCourseIntent';
  },
  handle(handlerInput) {
   const speechOutput = "Alright, what can I help you with?";
   const repromptSpeech = "So what is your question? ";
   
    //FOR REPEAT
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const repeat = repromptSpeech;
    attributes.repeat = repeat;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptSpeech)
      .getResponse();
  },
};

const LaunchHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
  },
  handle(handlerInput) {
    let speechOutput = "Welcome name. I’m here to guide you through your courses and help you understand concepts. " +  
    "First, tell me, which course would you like to review?";

    //FOR REPEAT
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const repeat = speechOutput;
    attributes.repeat = repeat;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `IntentRequest` &&
    handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = "To ask me a question, please begin the question with words " +
    "like How, Who, Why, or use a carrier phrase such as Tell me or Explain to me and so on";
    
    //FOR REPEAT
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const repeat = speechOutput;
    attributes.repeat = repeat;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const RepeatHandler = {
    canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `IntentRequest` &&
    handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const speechOutput = attributes.repeat;
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  },
  
};

const RequestHandlerChainErrorHandler = {
  canHandle(handlerInput, error) {
    return error.message === `RequestHandlerChain not found!`;
  },
  handle(handlerInput, error) {
    console.log(`~~~~~~~~~~~~~~~~~~~`);
    console.log(`Error handled: ${error.message}`);
    console.log(`~~~~~~~~~~~~~~~~~~~\n`);
    return handlerInput.responseBuilder
      .speak(`Oops! Looks like you forgot to register a handler.`)
      .getResponse();
  },
};

// const IntentNotFoundHandler = {
//   canHandle(handlerInput, error) {
//     return error.message === "Handler not found";
//   },
//   handle(handlerInput, error) {
//     return handlerInput.responseBuilder
//       .speak("It seems like you are not interacting properly with the skill. " +
//       "Please say help to learn how to use this skill")
//       .getResponse();
//   },
// }

const GenericErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~~~~~~~~~~~~~~~~`);
    console.log(`Error handled: ${error.message}`);
    console.log(`~~~~~~~~~~~~~~~~~~~\n`);
    
    const errorMessage = "It seems like you are not interacting properly with the skill. " +
    "Please say help to learn how to use this skill";
    
    //FOR REPEAT
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const repeat = errorMessage;
    attributes.repeat = repeat;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    return handlerInput.responseBuilder
      .speak(errorMessage)
      //.speak(`There was an error. The stack trace has been logged to Cloud Watch.`)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    CollectCourseIntentHandler,
    CollectQuestionIntentHandler,
    LaunchHandler,
    HelpHandler,
    RepeatHandler,
  )
  .addErrorHandlers(
    RequestHandlerChainErrorHandler,
    GenericErrorHandler
  )
  .lambda();