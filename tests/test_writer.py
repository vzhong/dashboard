from dashboard import writer
import unittest
from io import StringIO
from unittest.mock import patch
import tempfile
import os
import json


class TestConsoleWriter(unittest.TestCase):

    def setUp(self):
        self.w = writer.ConsoleWriter()

    def test_add(self):
        with patch('sys.stdout', new=StringIO()) as stdout:
            self.w.add({'foo': 1})
            self.w.add({'foo': 2})
            self.w.add({'foo': 2, 'bar': 3})
            out = stdout.getvalue().splitlines()
            self.assertListEqual(['foo'], out[0].split())
            self.assertListEqual(['1'], out[1].split())
            self.assertListEqual(['2'], out[2].split())
            self.assertListEqual(['bar', 'foo'], out[3].split())
            self.assertListEqual(['3', '2'], out[4].split())


class TestFileWriter(unittest.TestCase):

    def setUp(self):
        self.ftemp = tempfile.NamedTemporaryFile(delete=False).name
        self.w = writer.FileWriter(self.ftemp)

    def tearDown(self):
        if os.path.isfile(self.ftemp):
            os.remove(self.ftemp)

    def test_add(self):
        self.w.add({'foo': 1})
        self.w.add({'foo': 2})
        self.w.add({'foo': 2, 'bar': 3})
        with open(self.ftemp) as f:
            log = [json.loads(line) for line in f]
        self.assertListEqual(
            [
                {'foo': 1},
                {'foo': 2},
                {'foo': 2, 'bar': 3},
            ],
            log
        )

if __name__ == '__main__':
    unittest.main()
