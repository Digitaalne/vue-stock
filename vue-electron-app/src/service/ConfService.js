
const Conf = require('conf');
const config = new Conf();


export default {
    getActiveService(){
        return config.get('service')
    },
    getActiveDataService(){
        return config.get('dataService')
    },
    getConfiguration(name){
        return config.get(name)
    },
    getServiceConfiguration(name){
        return config.get(this.getActiveService() + "." +name)
    },
    setServiceConfiguration(name,value){
        config.set(this.getActiveService() + "." + name, value)

    },
    getDataServiceConfiguration(name){
        return config.get(this.getActiveDataService() + "." +name)
    },
    setDataServiceConfiguration(name,value){
        config.set(this.getActiveDataService() + "." + name, value)

    },
    setConfiguration(name,value){
        config.set(name, value)
    }
}
