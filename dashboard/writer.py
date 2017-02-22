import os
import ujson as json
import pyrebase
import tabulate


class Writer:
    def add(self, metrics):
        raise NotImplementedError()


class ConsoleWriter(Writer):
    def __init__(self):
        self.header = None
        self.cache = []
        self.last = None

    def add(self, metrics):
        keys = sorted(list(metrics.keys()))
        if keys != self.header:
            self.header = keys
        rows = []
        self.cache.append(metrics)
        for m in self.cache:
            rows.append([m.get(k, None) for k in self.header])
        s = tabulate.tabulate(rows, headers=self.header)
        if self.last:
            s = "\033[F"*len(self.last.splitlines()) + s
        print(s)
        self.last = s


class FileWriter(Writer):

    def __init__(self, fname):
        self.fname = fname
        if os.path.isfile(fname):
            os.remove(fname)

    def add(self, metrics):
        with open(self.fname, 'a') as f:
            f.write('{}\n'.format(json.dumps(metrics)))
            f.flush()


class FirebaseWriter(Writer):

    def __init__(self, name, delete_existing=False):
        fconfig = os.path.join(os.environ['HOME'], '.fb.config')
        assert os.path.isfile(fconfig), 'Failed to load config file from {}'.format(fconfig)
        with open(fconfig) as f:
            config = json.load(f)

        self.name = name
        self.fb = pyrebase.initialize_app(config)
        self.user = self.fb.auth().sign_in_with_email_and_password(config['email'], config['password'])
        if delete_existing:
            self.delete()

    def delete(self):
        self.user = self.fb.auth().refresh(self.user['refreshToken'])
        self.fb.database().child('experiments').child(self.name).remove(self.user['idToken'])

    def add(self, metrics):
        self.user = self.fb.auth().refresh(self.user['refreshToken'])
        self.fb.database().child('experiments').child(self.name).push(metrics, self.user['idToken'])


if __name__ == '__main__':
    w = FirebaseWriter('my_exp')
    import time
    for i in range(10):
        print(i)
        w.add({'iteration': i, 'score': i+1})
        time.sleep(1)
