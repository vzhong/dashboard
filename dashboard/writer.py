import os
import ujson as json
import pyrebase
import tabulate


class Writer:
    def add(self, metrics):
        raise NotImplementedError()


class ConsoleWriter(Writer):

    def __init__(self):
        self.header = set()
        self.cache = []

    def add(self, metrics):
        for k in metrics.keys():
            self.header.add(k)
        self.cache.append(metrics)
        header = sorted(list(self.header))
        rows = []
        for m in self.cache:
            rows.append([m.get(k, None) for k in header])
        s = tabulate.tabulate(rows, headers=self.header)
        s = "\033[F" * (len(s.splitlines()) - 1) + s
        print(s)


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

    def __init__(self, name, api_key=None, auth_domain=None, database_url=None, storage_bucket=None, delete_existing=False):
        fconfig = os.path.join(os.environ['HOME'], '.fb.config')
        config = {}
        if os.path.isfile(fconfig):
            with open(fconfig) as f:
                config.update(json.load(f))
        if api_key:
            config['apiKey'] = api_key
        if auth_domain:
            config['authDomain'] = auth_domain
        if database_url:
            config['databaseURL'] = database_url
        if storage_bucket:
            config['storageBucket'] = storage_bucket
        assert config, 'failed to load config! Pass in your config or make your config file at {}.'.format(fconfig)
        self.name = name
        self.fb = pyrebase.initialize_app(config)
        if delete_existing:
            self.delete()

    def delete(self):
        self.fb.database().child('experiments').child(self.name).remove()

    def add(self, metrics):
        try:
            self.fb.database().child('experiments').child(self.name).push(metrics)
        except Exception as e:
            print('Could not write to Dashboard')
            print(e)


if __name__ == '__main__':
    w = FirebaseWriter('my_exp')
    import time
    for i in range(10):
        print(i)
        w.add({'iteration': i, 'score': i+1})
        time.sleep(1)
