<!SLIDE subsection>
# Lock order inconsistencies


<!SLIDE centered-code>
# Example \#1

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        scoped_lock a(A);
        scoped_lock b(B);
    });

    thread t2([&] {
        scoped_lock b(B);
        scoped_lock a(A);
    });


<!SLIDE centered-code>
# Example \#2

    @@@ cpp
    mutex A, B, C;
    thread t1([&] {
        scoped_lock a(A);
        scoped_lock b(B);
    });

    thread t2([&] {
        scoped_lock b(B);
        scoped_lock c(C);
    });

    thread t3([&] {
        scoped_lock c(C);
        scoped_lock a(A);
    });


<!SLIDE>
# Same principle but harder to catch


<!SLIDE>
# Why are they so vicious?


<!SLIDE>
## Non deterministic


<!SLIDE>
.notes Very few variations in thread scheduling usually happens for different
runs of the same code in the same conditions. For this reason, odds are that
rare deadlocks still make it to production and only happen under "extreme"
conditions.

## Often uncaught by unit tests


<!SLIDE>
## Difficult to reproduce


<!SLIDE>
## Finding them requires thinking about parallel executions, which is difficult


<!SLIDE>
## We would like to detect them automatically and before they happen
