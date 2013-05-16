<!SLIDE smbullets>
# Limitations and drawbacks

* Requires modifying existing code
* No integration with an IDE
* Current implementation is immature


<!SLIDE smbullets>
# Roadmap
* Support a wider set of synchronization primitives
* Provide integration with more libraries
* Reduce false positives further (I have some ideas)


<!SLIDE commandline>
.notes Right now, the integration is only with pthreads because I lack access
to a windows machine.

## Want to try it?

    $ cd ${boost_root}

    $ patch -p1 < ${d2_root}/integrations/boost/1_53_00.diff

    $ ./bjam -j64 # :)
