# dashboard

Dashboard provides utilities to make and visualize experiment logs. Yes, now you can run your experiments on your server and view your logs on your phone like you've always wanted.


## Reporting

```python
from dashboard import reporter
import numpy as np

r = reporter.Reporter()

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
```

Note that in order for `FirebaseWriter` to work, you need to create a config file `~/.fb.config` like follows:

```json
{
  "email": "email for a user in your Firebase",
  "password": "password for the user in your Firebase",
  "secret": "some secret (you can put whatever you want)",
  "apiKey": "Firebase API key",
  "authDomain": "Firebase auth domain",
  "databaseURL": "Firebase database URL",
  "storageBucket": "Firebase storage bucket"
}
```

All of these come with your Firebase config, with the exception of `email` and `password` which correspond to a user that you create inside your Firebase (who has access to the database).


## Firebase Web Client

![Dashboard client](/screenshot/client.gif)

An example client operating off of my personal Firebase can be found in the `client` directory.

NOTE: You will **not** be able to read/write to the database with this client until you have done the following:

1. Create an app on Firebase and locate your config according to [this guide](https://firebase.google.com/docs/web/setup).
2. Enable email accounts and create an account/password for `FirebaseWriter` according to [this guide](https://firebase.google.com/docs/auth/web/password-auth). Note that **you don't need to do this via Javascript**, instead, just go to your users tab in Firebase and create an account.
3. Create `~/.fb.config`, copying in your Firebase config from Step 1 and the account credentials from Step 2.
4. Copy in your Firebase config from Step 1 into `main.js`.

Once you have done so, you can launch the web server in one of the following ways.

### Hosting static webpages

You can host the web pages on your machine by launching a simple http server.

```bash
# this is assuming you are using python 3
cd client/public && python -m http.server 9090
```

You should now be able to visit [localhost:9090](http://localhost:9090).

### Hosting on Firebase

Follow [these instructions](https://firebase.google.com/docs/hosting/quickstart) to set up Firebase tools.
Remember that you will need to change `client/.firebaserc` to point to your own app.

Next, the following command will deploy your app and print out the hosted URL.

```bash
cd client && firebase deploy
```

### Static webpage

You can actually use a static web page! Just open `client/public/index.html`.


# Contribution

Pull requests are welcome!

The project is set up as follows:

- `dashboard` contains the Dashboard python package, whose installation script is `setup.py`.
- `client` contains the Firebase app.
- `client/public` contains source code for the client, mostly written in very basic [VueJS](https://vuejs.org/).
