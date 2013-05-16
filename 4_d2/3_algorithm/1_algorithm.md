<!SLIDE subsection>
# The algorithm


<!SLIDE>
# Disclaimer
I am __not__ the author of the algorithm. It is presented in:

"Detection of deadlock potentials in multithreaded programs"<br>
IBM Journal of Research and Development, vol.54, no.5, pp.3:1,3:15<br>
Sept.-Oct. 2010


<!SLIDE>
## A note for the rest of the presentation:

For brevity, unlocking mutexes and joining threads will often be omitted.<br>
When omitted, assume the mutexes are unlocked in reverse order of locking
and threads are joined in reverse order of starting.


<!SLIDE centered-code>
## So these are the same:

    @@@ cpp
    mutex A, B;
    A.lock();
    B.lock();
    B.unlock();
    A.unlock();

## and

    @@@ cpp
    mutex A, B;
    A.lock();
    B.lock();


<!SLIDE centered-code>
## And so are these:

    @@@ cpp
    thread t1([] {});
    thread t2([] {});
    t2.join();
    t1.join();

## and

    @@@ cpp
    thread t1([] {});
    thread t2([] {});


<!SLIDE smbullets>
.notes Specify that we'll be adding annotation on the graph to encode more
information like segmentation and gatelocks. Precise that we'll start with
the most basic graph and add annotations as we go to improve the algorithm.

## The basic idea is to build a graph where:

* Vertices represent synchronization objects
* An edge from `u` to `v` means that a thread acquired `v` while holding `u`
* A cycle in the graph represents a potential deadlock
