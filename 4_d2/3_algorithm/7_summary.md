<!SLIDE>
# Summary of the algorithm


<!SLIDE smbullets>
## The lock graph is a directed multigraph

* Vertices represent synchronization objects
* An edge from `u` to `v` means that a thread acquired `v` while holding `u`
* A cycle in the graph represents a potential deadlock


<!SLIDE smbullets>
## The segmentation graph is a directed acyclic graph

* Vertices represent segments of code separated by `start`s and `join`s
* A path from `u` to `v` means that `u` happens before `v`


<!SLIDE smbullets>
## We label each edge of the lock graph with

* The thread that performed the acquire
* The set of locks held by the thread ("gatelocks")
* The code segment in which the acquire is performed


<!SLIDE>
## To reduce false positives, we ignore a cycle if...


<!SLIDE small centered-code>
## Any two edges are in the same thread

    @@@ cpp
    mutex A, B;
    thread t1([&] {
      A.lock();
        B.lock();
        B.unlock();
      A.unlock();

      B.lock();
        A.lock();
        A.unlock();
      B.unlock();
    });


<!SLIDE small centered-code>
## Any two edges share common "gatelocks"

    @@@ cpp
    mutex A, B, G;
    thread t1([&] {
      G.lock();
        A.lock();
          B.lock();
          B.unlock();
        A.unlock();
      G.unlock();
    });

    thread t2([&] {
      G.lock();
        B.lock();
          A.lock();
          A.unlock();
        B.unlock();
      G.unlock();
    });


<!SLIDE small centered-code>
## Any edge happens before any other edge in the cycle

    @@@ cpp
    mutex A, B;
    thread t1([&] {
      A.lock();
        B.lock();
        B.unlock();
      A.unlock();
    });
    t1.join();

    thread t2([&] {
      B.lock();
        A.lock();
        A.unlock();
      B.unlock();
    });
