class Extension:

    def __init__(self, ipython):
        self.ipython = ipython

    def target_func(self, comm, msg):
    # comm is the kernel Comm instance
    # msg is the comm_open message

        # Register handler for later messages
        @comm.on_msg
        def _recv(msg):

            # send reply message
            comm.send({'echo': "from-kernel"})

            # push the data as variables to the user's namespace
            self.ipython.push(msg['content']['data'])

        # Send data to the frontend on creation
        comm.send({"msgtype": "from-kernel"})

    def register_comm(self):
        self.ipython.kernel.comm_manager.register_target("my_comm_target", self.target_func)


def load_ipython_extension(ipython):
    # The `ipython` argument is the currently active `InteractiveShell`
    # instance, which can be used in any way. This allows you to register
    # new magics or aliases, for example.
    # print("Hello World")
    ext = Extension(ipython)
    ext.register_comm()
    

def unload_ipython_extension(ipython):
    # If you want your extension to be unloadable, put that logic here.
    print("Closed")