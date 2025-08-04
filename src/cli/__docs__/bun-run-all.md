# bun-run-all

```
Usage: bun-run-all [options] <scripts...>

Run given package scripts in parallel or sequential by using bun.

Arguments:
  scripts                  A list of package scripts' names.

Options:
  -c, --continue-on-error  Continue executing other/subsequent tasks even if a
                           task threw an error
  -p, --parallel           Run a group of tasks in parallel.
  -s, --sequential         Run a group of tasks sequentially.
  -t, --time               Report execution time for each task.
  -h, --help               display help for command

Example usage:
$ bun-run-all script1 script2


```
