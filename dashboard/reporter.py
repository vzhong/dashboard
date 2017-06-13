from collections import defaultdict


class Reporter:
    """
    Utility for aggregating metrics
    """

    def __init__(self):
        self.log = []
        self.keys = set()

    def add(self, metrics):
        """
        Adds metrics to the cache
        """
        for k in metrics.keys():
            self.keys.add(k)
        self.log.append(metrics)

    def clear(self):
        """
        Empties the cache of stored metrics
        """
        del self.log[:]
        self.keys.clear()

    def summary(self, ignore=('epoch', 'iteration')):
        """
        Computes averages of metrics stored in the cache

        Args:
            ignore (list): these metrics will be ignored and removed from the summary
        """
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
    writers = [writer.ConsoleWriter()]

    for i in range(10):
        d = {'iteration': i, 'score': i * 2}
        r.add(d)
        for w in writers:
            w.add(d)
        time.sleep(1)
