'use strict';

const fmsService    = require( '../../lib/').default;

/**
 * custom service with only internal only
 */
class Service {
  constructor(options){
    this.transactor = options.transactor;
  }
  setup(){

  }

  /**
   * run a script
   * @param scriptName
   * @param data - will be stringified
   * @returns {*}
   */
  run(scriptName, data){
    const requestData = {
       params : JSON.stringify(data),
      '-script' : scriptName
    };

    return this.transactor.create(requestData).then((result)=>{
      if(result.restUseResult===1){
        return JSON.parse(result.result);
      }
      else{
        return result;
      }
    });
  }
}

export default function(options){

  if(!options.layout){
    throw new Error('Script Service needs a \'layout\'');
  }

  if(!options.connection){
    throw new Error('Script Service needs a \'connection\'');
  }


  return function(){
    const app = this;

    const model = {
      layout : options.layout,
      idField : options.idField,
    };


    const baseServicePath = 'fms-' + options.connection.db + '-' + options.layout;

    const utilityPath = baseServicePath + '-script-utility';


    // we need this service to create records on.
    const RestUtility = fmsService({model, connection: options.connection});
    app.use( utilityPath, RestUtility);

    const RestUtilityService = app.service(utilityPath);



    const scriptServicePath = baseServicePath + '-script';

    // THEN create and expose a custom Service that has one method, 'run'
    app.use(scriptServicePath, new Service({transactor : RestUtilityService}) );


    const ScriptService = app.service(scriptServicePath);


  };
}

