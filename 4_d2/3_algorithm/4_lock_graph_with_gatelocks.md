<!SLIDE>
This time, we will augment the edge labels to record the set of locks held by
the thread causing an edge to be added to the lock graph.

A cycle is not valid if the gatelock sets of any two edges in the cycle
intersect, i.e. if they share one or more gatelocks.


<!SLIDE graph_example>
## Example \#7

    @@@ cpp
    mutex A, B, C, D;

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A; B; C; D;
})


<!SLIDE graph_example>
## Example \#7
`t1` acquires `A` while holding nothing

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        // ...
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A; B; C; D;
})


<!SLIDE graph_example>
.notes It is NOT redundant to put `A` in the set of gatelocks, as can be seen
in the next slide.

## Example \#7
`t1` acquires `B` while holding `A`; `A` is put in the gatelocks for that edge

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        B.lock();
        // ...
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A; B; C; D;
    A->B [label="t1 : {A}"];
})


<!SLIDE graph_example>
.notes Here, we can see that putting `B` in the set of gatelocks when
acquiring `C` is not redundant, because the edge from `A` to `C` needs it.

## Example \#7
`t1` acquires `C` while holding `A` and `B`; all the edges that are added to
the graph are marked with these gatelocks

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        B.lock();
        C.lock();
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = curved];
    A; B; C; D;
    A->B [label="t1 : {A}"];
    A->C [label="t1 : {A, B}"];
    B->C [label="t1 : {A, B}"];
})


<!SLIDE graph_example>
## Example \#7
`t2` acquires `D` while holding nothing

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        B.lock();
        C.lock();
    });

    thread t2([&] {
        D.lock();
        // ...
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = curved];
    A->B [label="t1 : {A}"];
    A->C [label="t1 : {A, B}"];
    B->C [label="t1 : {A, B}"];
})


<!SLIDE graph_example>
## Example \#7
`t2` acquires `A` while holding `D`

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        B.lock();
        C.lock();
    });

    thread t2([&] {
        D.lock();
        A.lock();
        // ...
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = curved];
    A->B [label="t1 : {A}"];
    A->C [label="t1 : {A, B}"];
    B->C [label="t1 : {A, B}"];
    D->A [label="t2 : {D}"];
})


<!SLIDE graph_example>
## Example \#7
`t2` acquires `B` while holding `D` and `A`

    @@@ cpp
    mutex A, B, C, D;
    thread t1([&] {
        A.lock();
        B.lock();
        C.lock();
    });

    thread t2([&] {
        D.lock();
        A.lock();
        B.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = curved];
    A->B [label="t1 : {A}"];
    A->C [label="t1 : {A, B}"];
    B->C [label="t1 : {A, B}"];
    D->A [label="t2 : {D}"];
    D->B [label="t2 : {D, A}"];
    A->B [label="t2 : {D, A}"];
})


<!SLIDE>
## Now consider the previous graph with a false positive:

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR, splines = curved];
    G->A [label="t1 : {G}"];
    G->B [label="t1 : {G, A}"];
    A->B [label="t1 : {G, A}"];
    G->B [label="t2 : {G}"];
    G->A [label="t2 : {G, B}"];
    B->A [label="t2 : {G, B}"];
})

As expected, the false positive is inhibited by the intersecting sets of
gatelocks.


<!SLIDE graph_example>
## However, consider this situation, where `t1` and `t2` will never run in parallel:

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });
    t1.join();

    thread t2([&] {
        B.lock();
        A.lock();
    });
    t2.join();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A->B [label="t1 : {A}"];
    B->A [label="t2 : {B}"];
})


<!SLIDE>
## We say that `t1` 'happens-before' `t2`.
