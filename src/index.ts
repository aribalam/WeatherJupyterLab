import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker, NotebookPanel
} from '@jupyterlab/notebook'

import {
  SidePanel
} from './sidepanel';

/*
  Creates a comm instance by opening a connection to the comm target
*/
function createKernelComm(panel: NotebookPanel): Promise<any> {

    // Open a comm in the panel to send weather data
    const comm = panel.sessionContext.session.kernel.createComm("my_comm_target");
    comm.onMsg = (msg) => {
        console.log("Message received");
    };
    comm.open({ 'msgtype': 'from-frontend' });

    return Promise.resolve(comm);
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'weatherext',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebooks: INotebookTracker) => {

    console.log('JupyterLab extension weatherext is activated!');

    // Create a Side Panel and add it to the left area
    const sidePanel = new SidePanel();
    sidePanel.addClass('side-panel');
    app.shell.add(sidePanel, 'left');

    notebooks.widgetAdded.connect((sender: any, panel: NotebookPanel) => {

      console.log("Kernel Widget added.");      
      panel.sessionContext.ready.then(() => {

          console.log("Session context ready.");

          // Load Kernel Extension by executing %load_ext on notebook
          panel.sessionContext.session.kernel.requestExecute({
            code: '%load_ext kernel_extension'
          });
          
          // open a comm with the current kernel
          return createKernelComm(panel);
      
        }).then((comm: any) => {
          
          // connect to the sidepanel ongetData signal
          sidePanel.onGetData.connect((sender: SidePanel, data: any) => {

              // send the data to the kernel
              comm.send({'weather_data': data});
          })

      });

    });
    
  }
};

export default extension;
