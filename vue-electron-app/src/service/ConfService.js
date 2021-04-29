
const Conf = require('conf');
const config = new Conf();


export default {
    getActiveService(){
        return config.get('service')
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
    setConfiguration(name,value){
        config.set(name, value)
    }
}
