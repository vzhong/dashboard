import os
import json
from datetime import datetime


class Writer:

    def add(self, metrics):
        """
        Args:
            metrics (dict): metrics to write
        """
        raise NotImplementedError()


class ConsoleWriter(Writer):
    """
    Writes metrics to standard output

    Attributes:
        header (set): headers with which to format each output line
    """

    def __init__(self):
        self.header = set()

    def add(self, metrics):
        for k, v in metrics.items():
            if isinstance(v, float):
                metrics[k] = "{0:.6g}".format(v)
        old_header_size = len(self.header)
        for k in metrics.keys():
            self.header.add(k)
        header = sorted(list(self.header))
        row = [metrics[h] for h in header]
        fmt = "{: >10} " * len(header)
        if len(header) != old_header_size:
            print(fmt.format(*header))
        print(fmt.format(*row))


class FileWriter(Writer):
    """
    Writes metrics to file

    Attributes:
        fname (str): file to write to
    """

    def __init__(self, fname):
        self.fname = fname
        if os.path.isfile(fname):
            os.remove(fname)

    def add(self, metrics):
        with open(self.fname, 'a') as f:
            f.write('{}\n'.format(json.dumps(metrics)))
            f.flush()


class FirebaseWriter(Writer):
    """
    Writes metrics to a database on Firebase.

    Note:
        In order for this to work, you must set up an app on Firebase and do the following:
        1. Copy your app's configuration to a JSON file at ``~/.fb.config``
        2. Setup email/password login and create an user
        3. Write the user's email and password to ``~/.fb.config`` under the fields ``email`` and ``password``
    """

    def __init__(self, name, config={}, delete_existing=False):
        try:
            import pyrebase
        except Exception as e:
            print(e)
            raise Exception("Please install pyrebase in order to use FirebaseWriter: pip install pyrebase")
        assert name, '"name" cannot be empty!'
        fconfig = os.path.join(os.environ['HOME'], '.fb.config')
        assert os.path.isfile(fconfig), 'Failed to load config file from {}'.format(fconfig)
        with open(fconfig) as f:
            fb_config = json.load(f)

        self.name = name
        self.config = config
        self.fb = pyrebase.initialize_app(fb_config)
        self.user = self.fb.auth().sign_in_with_email_and_password(fb_config['email'], fb_config['password'])
        if delete_existing:
            self.delete()
        self.config['time'] = datetime.now().strftime('%c')
        self.fb.database().child('experiment_listings').child(self.name).set(self.config, self.user['idToken'])

    def delete(self):
        """
        Deletes the experiment from Firebase
        """
        self.user = self.fb.auth().refresh(self.user['refreshToken'])
        self.fb.database().child('experiments').child(self.name).remove(self.user['idToken'])
        self.fb.database().child('experiment_listings').child(self.name).remove(self.user['idToken'])

    def add(self, metrics):
        self.user = self.fb.auth().refresh(self.user['refreshToken'])
        try:
            self.fb.database().child('experiments').child(self.name).push(metrics, self.user['idToken'])
        except Exception as e:
            print('Could not write to Dashboard')
            print(e)


if __name__ == '__main__':
    from dashboard import writer
    from time import sleep
    import numpy as np
    import random
    random.seed()

    console_writer = writer.ConsoleWriter()
    file_writer = writer.FileWriter('foo.log')   # writes to 'foo.log'
    for epoch in range(3):
        for i in range(2):
            metrics = {'f1': np.random.uniform(0, 1), 'iteration': i, 'epoch': epoch}
            console_writer.add(metrics)
            file_writer.add(metrics)
            sleep(0.5)

    exp1_hyperparams = {'d_hid': 100, 'dropout': 0.5, 'model': 'foo'}
    exp2_hyperparams = {'d_hid': 200, 'dropout': 0.3, 'model': 'bar', 'comment': 'hello world!'}
    writer1 = writer.FirebaseWriter('myexp1', exp1_hyperparams, delete_existing=True)
    writer2 = writer.FirebaseWriter('myexp2', exp2_hyperparams, delete_existing=True)
    for i in range(5):
        writer1.add({'iteration': i, 'score': random.uniform(0, 10)})
        writer2.add({'iteration': i, 'score': random.uniform(0, 10)})
        print('wrote to firebase data from iteration {}'.format(i))
