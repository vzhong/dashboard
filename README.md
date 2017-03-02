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
  "secret": "some secret (you can put whatever you want)",
  "apiKey": "Firebase API key",
  "authDomain": "Firebase auth domain",
  "databaseURL": "Firebase database URL",
  "storageBucket": "Firebase storage bucket"
}
```

All of these come with your Firebase config, with the exception of `email` and `password` which correspond to a user that you create inside your Firebase (who has access to the database).


## Firebase Web Client

An example client operating off of my personal Firebase can be found in the `client` directory.

NOTE: You will **not** be able to read/write to the database with this client until you have done the following:

1. Create an app on Firebase and locate your config according to [this guide](https://firebase.google.com/docs/web/setup).
2. Enable email accounts and create an account/password for `FirebaseWriter` according to [this guide](https://firebase.google.com/docs/auth/web/password-auth). Note that **you don't need to do this via Javascript**, instead, just go to your users tab in Firebase and create an account.
3. Also enable Google accounts. You will use Google accounts for login via the web client and the email account from Step 2. for `FirebaseWriter`. Note that these two accounts need to have different emails, unless you disable this restriction in Firebase.
4. Create `~/.fb.config`, copying in your Firebase config from Step 1 and the account credentials from Step 2.
5. Copy in your Firebase config from Step 1 into `main.js`.

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

There is of course a catch to this: the redirect authentication I am using does not work from `file://...`.

You can either fix the authentication by [authenticating via some other means](http://stackoverflow.com/questions/37362957/ionic-framework-and-firebase-3-x-version-this-domain-is-not-authorized-for-oaut/37439461#37439461),
or, if you just don't care, you can [change the rules of your database](https://firebase.google.com/docs/database/security/) to allow reads by anybody (probably not a good idea).

![Dashboard client](/screenshot/client.gif)


# Contribution

Pull requests are welcome!

The project is set up as follows:

- `dashboard` contains the Dashboard python package, whose installation script is `setup.py`.
- `client` contains the Firebase app.
- `client/public` contains source code for the client, mostly written in very basic [VueJS](https://vuejs.org/).
