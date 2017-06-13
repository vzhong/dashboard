from dashboard.reporter import Reporter
import unittest


class TestReporter(unittest.TestCase):

    def setUp(self):
        self.r = Reporter()

    def test_add(self):
        self.r.add({'foo': 1, 'bar': 2})
        self.assertListEqual(
            [{'foo': 1, 'bar': 2}],
            self.r.log
        )
        self.assertEqual(
            {'foo', 'bar'},
            self.r.keys
        )

    def test_clear(self):
        self.r.log = [{'a': 1}]
        self.r.keyseys = {'a'}
        self.r.clear()
        self.assertListEqual([], self.r.log)
        self.assertEqual(set(), self.r.keys)

    def test_summary(self):
        for i in range(5):
            self.r.add({'i': i, 'score': i})
        self.assertDictEqual(
            {'score': sum(list(range(5))) / 5},
            self.r.summary(ignore=('i',))
        )


if __name__ == '__main__':
    unittest.main()
