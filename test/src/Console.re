type console;
[@bs.val] external con : console = "console"
[@bs.send] external jsLog: (console, string) => unit = "log"

let log = str => jsLog(con, str)
