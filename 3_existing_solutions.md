<!SLIDE subsection>
# Existing solutions


<!SLIDE smbullets>
## Never hold more than one lock at once

* Not realistic for non-trivial programs


<!SLIDE smbullets>
## Determine a hierarchy among locks and respect it

* Error-prone
* Not realistic for non-trivial programs


<!SLIDE smbullets>
## Disturb thread scheduling to provoke hidden deadlocks

* Requires several runs of the program
* Good idea that could be mixed with other approaches


<!SLIDE smbullets>
## Use an algorithm to break deadlocks when they happen

* Overhead required to check for deadlock conditions
* Policy for breaking deadlocks can't be pretty: kill the thread
* Misses the point: deadlocks are a bug, not a runtime mishap


<!SLIDE smbullets>
## Intel® Inspector XE

* Detects deadlocks involving up to 4 threads only
* Huge overhead
* Proprietary and costly license
* Exact capabilities for deadlock detection unknown


<!SLIDE smbullets>
## Valgrind (Helgrind)

* Runs the program on a virtual processor, one thread at a time
* Limited to POSIX pthreads threading primitives
