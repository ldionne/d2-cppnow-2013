<!SLIDE graph_example>
.notes Two nodes are created because we created two locks, but no edges are
created because we did not lock anything.

## Example \#1

    @@@ cpp
    mutex A, B;

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A; B;
})


<!SLIDE graph_example>
## Example \#1
No edge is created; the main thread does not hold anything when it acquires `A`.

    @@@ cpp
    mutex A, B;
    A.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A; B;
})


<!SLIDE graph_example>
## Example \#1
The main thread holds `A` when it acquires `B`; we add an edge from `A` to `B`.

    @@@ cpp
    mutex A, B;
    A.lock();
        B.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
})


<!SLIDE graph_example>
## Example \#1
The graph is not modified on releases.

    @@@ cpp
    mutex A, B;
    A.lock();
        B.lock();
        B.unlock();
    A.unlock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
})


<!SLIDE graph_example>
.notes Since there is already an edge from A to B in the graph, we don't add
it redundantly if a thread locks B again while holding A.

## Example \#1
We don't add redundant edges.

    @@@ cpp
    mutex A, B;
    A.lock();
        B.lock();
        B.unlock();
    A.unlock();

    A.lock();
    B.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A -> B;
})


<!SLIDE graph_example>
## Example \#2

    @@@ cpp
    mutex A, B, C, D;
    A.lock();
    B.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A; B; C; D;
    A->B;
})


<!SLIDE graph_example>
## Example \#2

We're really computing the transitive closure of the "is held by a thread
when acquiring X" relation.

    @@@ cpp
    mutex A, B, C, D;
    A.lock();
    B.lock();
    C.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A; B; C; D;
    A->B;
    A->C;
    B->C;
})


<!SLIDE graph_example>
## Example \#2

We're really computing the transitive closure of the "is held by a thread
when acquiring X" relation.

    @@@ cpp
    mutex A, B, C, D;
    A.lock();
    B.lock();
    C.lock();
    D.lock();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    A->C;
    B->C;
    A->D;
    B->D;
    C->D;
})


<!SLIDE graph_example>
## Example \#3: A potential deadlock

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
})


<!SLIDE graph_example>
.notes Clearly, there is a cycle in the graph iff two locks were acquired in
some order and then acquired in a different order.

## Example \#3: A potential deadlock

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    thread t2([&] {
        B.lock();
        A.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    B->A;
})


<!SLIDE graph_example>
## Example \# 4: Another potential deadlock

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&]{
        A.lock();
        B.lock();
        C.lock();
        D.lock();
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    A->C;
    B->C;
    A->D;
    B->D;
    C->D;
})


<!SLIDE graph_example>
## Example \#4: Another potential deadlock

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&]{
        A.lock();
        B.lock();
        C.lock();
        D.lock();
    });

    thread t2([&]{
        D.lock();
        B.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    A->C;
    B->C;
    A->D;
    B->D;
    C->D;
    D->B;
})


<!SLIDE source_code_270P graph_example>
## Example \#5: It works for an arbitrary number of threads

    @@@ cpp
    mutex A, B, C;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    thread t2([&] {
        B.lock();
        C.lock();
    });

    thread t3([&] {
        C.lock();
        A.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    B->C;
    C->A;
})


<!SLIDE graph_example>
.notes Since there is only one thread involved, a deadlock can't possibly
happen. Actually, the generalization is that all the code in this thread is
implicitly serialized (because it is run in a single thread of execution).
Therefore, there exists an implicit happens-before relationship between the
statements. Note that a deadlock could still happen if a non-recursive lock
was locked recursively by a thread. However, whether such a deadlock happens
depends on whether the code path leading to it is taken. In other words, it
is deterministic as far as thread scheduling is concerned. If the code path
is taken, the deadlock is 100% to happen. Otherwise, the deadlock won't
happen and we won't detect anything anyway since the code path was _not_
taken (and we're doing dynamic analysis).

## However, the algorithm can report false positives. Consider:

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

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A->B;
    B->A;
})
