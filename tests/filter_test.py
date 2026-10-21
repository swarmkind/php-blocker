import importlib.util
import pathlib
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('filter_php', 'scripts/filter-php.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class FilterTests(unittest.TestCase):
    def test_extracts_php_only_and_rejects_invalid_source(self):
        with tempfile.TemporaryDirectory() as directory:
            source = pathlib.Path(directory) / 'sample.csv'
            source.write_text('domain,technology\nEXAMPLE.COM,PHP\nexample.com,PHP\nother.test,React\n')
            self.assertEqual(module.extract(source), ['example.com'])
            source.write_text('domain,technology\n*.example.com,PHP\n')
            with self.assertRaises(ValueError): module.extract(source)
            source.write_text('domain,not_technology\nexample.com,PHP\n')
            with self.assertRaises(ValueError): module.extract(source)

if __name__ == '__main__': unittest.main()
