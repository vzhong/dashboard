# dashboard

Dashboard provides utilities to make and visualize experiment logs.


## Reporting

```python
from dashboard import report
import numpy as np

r = report.Reporter()

for epoch in range(10):
    for i in range(5):
        metrics = {'loss': np.random.uniform(0, 1), 'f1': np.random.uniform(0, 1)}
        r.add(metrics)
    print(r.summary())  # prints {'loss': <average loss>, 'f1': <average f1>}
    r.clear()
```


## Writers

![Console writer](/screenshot/console.gif)

```python
from dashboard import writer
from time import sleep
import numpy as np

writers = [
    writer.ConsoleWriter(),         # writes to stdout
    writer.FileWriter('foo.log'),   # writes to 'foo.log'
    writer.FirebaseWriter('my_exp') # writes to Firebase (details below)
]

for epoch in range(3):
    for i in range(2):
        metrics = {'f1': np.random.uniform(0, 1), 'iteration': i, 'epoch': epoch}
        for w in writers:
            w.add(metrics)
        sleep(0.5)
```

Note that in order for `FirebaseWriter` to work, you need to create a config file `~/.fb.config` like follows:

```json
{
  "email": "email for a user in your Firebase",
  "password": "password for the user in your Firebase",
  "secret": "Firebase secret",
  "apiKey": "Firebase API key",
  "authDomain": "Firebase auth domain",
  "databaseURL": "Firebase database URL",
  "storageBucket": "Firebase storage bucket"
}
```

All of these come with your Firebase config, with the exception of `email` and `password` which correspond to a user that you create inside your Firebase (who has access to the database).


## Client

An example client operating off of my personal Firebase can be found in the `client` directory.
You can create your own client by replacing the config information in `index.html` with your own Firebase config.

![Dashboard client](/screenshot/client.gif)
