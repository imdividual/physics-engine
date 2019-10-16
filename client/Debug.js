export default class Debug {

  // enables or disables reporting
  static active = true;

  static log(report) {
    if(Debug.active) {
      if(report.type === 'info') {
        console.log('MESSAGE: ' + report.msg);
      } else if(report.type === 'error' || report.type === 'fatal') {
        console.log('ERROR: ' + report.msg);
      }
    }
  }

  static set active(status) {
    Debug.active = status;
  }

}
