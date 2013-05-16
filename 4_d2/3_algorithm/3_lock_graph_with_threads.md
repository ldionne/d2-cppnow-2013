<!SLIDE>
.notes If a cycle contains two edges labelled with the same thread, it is
ignored because the represented deadlock would require code in the same
thread to run concurrently, which is impossible. This is effectively a
special case of the happens-before relationship.

Let's augment the lock graph by labelling each edge with the thread that
caused that edge to be added.

We will ignore cycles containing two edges labelled with the same thread.


<!SLIDE graph_example>
## Example \#6
No labels, no edges, like the basic graph.

    @@@ cpp
    mutex A, B;

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    A; B;
})


<!SLIDE graph_example>
## Example \#6
When an edge is added, we label it with the thread that caused its addition.

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A->B [label=t1];
})


<!SLIDE graph_example>
## Example \#6
We add a parallel edge if the label on it is different from that of existing
edges.

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    thread t2([&] {
        A.lock();
        B.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A->B [label=t1];
    A->B [label=t2];
})


<!SLIDE graph_example>
Consider the previous graph with a false positive. We now ignore the single
threaded cycle:

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
            B.lock();
            B.unlock();
        A.unlock();

        B.lock();
        A.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A->B [label=t1];
    B->A [label=t1];
})


<!SLIDE graph_example source_code_230P>
.notes The A->B->C cycle with three different threads is a real potential
deadlock. The other A->B->C with t1, t2, t2 is a false positive and is ignore
because t2 appears twice in the cycle.

And cycles still represent potential deadlocks.

    @@@ cpp
    mutex A, B, C;
    thread t1([&] {
        A.lock();
        B.lock();
    });

    thread t2([&] {
        B.lock();
            C.lock();
            C.unlock();
        B.unlock();

        C.lock();
        A.lock();
    });

    thread t3([&] {
        C.lock();
        A.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, rankdir = LR];
    A->B [label=t1];
    B->C [label=t2];
    C->A [label=t2];
    C->A [label=t3];
})


<!SLIDE graph_example>
.notes The deadlock may never happen because G has to be held by both threads
in order to enter the dangerous section of the code.

However, consider this situation. Both threads must be holding `G`, which
is impossible:

    @@@ cpp
    mutex A, B, G;
    thread t1([&] {
        G.lock();
        A.lock();
        B.lock();
    });

    thread t2([&] {
        G.lock();
        B.lock();
        A.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent];
    {rank = same; A; B;}
    G->A [label=t1];
    G->B [label=t1];
    A->B [label=t1];
    G->B [label=t2];
    G->A [label=t2];
    B->A [label=t2];
})


<!SLIDE>
## We say that `G` is a 'gatelock' protecting that cycle
