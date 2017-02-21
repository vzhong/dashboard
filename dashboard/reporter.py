from collections import defaultdict


class Reporter:

    def __init__(self):
        self.log = []
        self.keys = set()

    def add(self, metrics):
        for k in metrics.keys():
            self.keys.add(k)
        self.log.append(metrics)

    def clear(self):
        self.log.clear()
        self.keys.clear()

    def summary(self, ignore=('epoch', 'iteration')):
        s = defaultdict(list)
        for m in self.log:
            for k, v in m.items():
                if k not in ignore:
                    s[k].append(v)
        for k, v in s.items():
            s[k] = sum(v) / len(v)
        return s


if __name__ == '__main__':
    from dashboard import writer
    import time
    r = Reporter()
    writers = [writer.ConsoleWriter(), writer.FileWriter('foo.jsonl')]

    for i in range(10):
        d = {'iteration': i, 'score': i * 2}
        r.add(d)
        for w in writers:
            w.add(d)
        time.sleep(1)
