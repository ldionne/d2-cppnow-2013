<!SLIDE>
Let's augment the lock graph by recording the segment in which an acquire is
made.

A cycle is not valid if any edge in the cycle happens before another edge in
the cycle.


<!SLIDE graph_example lock_graph_with_segments>
Let's go back to our false positive:

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


<!SLIDE graph_example lock_graph_with_segments>
## `main` starts in segment 0

    @@@ cpp
    mutex A, B;

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 [label = s0];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent];
    A; B;
})


<!SLIDE graph_example lock_graph_with_segments>
## `main` starts `t1`; `main` and `t1` get new segments

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        // ...
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1;
        main0 [label = s0];
        main1 [label = s1];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10;
        t10 [label = s2];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent];
    A; B;
})


<!SLIDE graph_example lock_graph_with_segments>
## `t1` acquires `A` and then `B`, both in segment 2

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1;
        main0 [label = s0];
        main1 [label = s1];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10;
        t10 [label = s2];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent, rankdir = LR];
    A; B;
    A -> B [label = "t1 : B in s2 : {A in s2}"];
})


<!SLIDE graph_example lock_graph_with_segments>
## `main` joins `t1`; `main` continues in a new segment

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });
    t1.join();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main2;
        t10 [label = s2];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent, rankdir = LR];
    A; B;
    A -> B [label = "t1 : B in s2 : {A in s2}"];
})


<!SLIDE graph_example lock_graph_with_segments source_code_230P>
## `main` starts `t2`; `main` and `t2` get new segments

    @@@ cpp
    mutex A, B;
    thread t1([&] {
        A.lock();
        B.lock();
    });
    t1.join();

    thread t2([&] {
        // ...
    });

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2 -> main3;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
        main3 [label = s5];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main2;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main2 -> t20;
        t20 [label = s4];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent, rankdir = LR];
    A; B;
    A -> B [label = "t1 : B in s2 : {A in s2}"];
})


<!SLIDE graph_example lock_graph_with_segments source_code_230P>
## `t2` locks `B` and then `A`, both in segment 4

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

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2 -> main3;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
        main3 [label = s5];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main2;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main2 -> t20;
        t20 [label = s4];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent, rankdir = LR];
    A; B;
    A -> B [label = "t1 : B in s2 : {A in s2}"];
    B -> A [label = "t2 : A in s4 : {B in s4}"];
})


<!SLIDE graph_example lock_graph_with_segments source_code_230P>
## `main` joins `t2`; `main` continues in a new segment

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
    label = "segmentation graph";
    graph [splines = ortho, bgcolor = transparent];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2 -> main3 -> main4;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
        main3 [label = s5];
        main4 [label = s6];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main2;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main2 -> t20 -> main4;
        t20 [label = s4];
    }
})

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    label = "lock graph";
    graph [bgcolor = transparent, rankdir = LR];
    A; B;
    A -> B [label = "t1 : B in s2 : {A in s2}"];
    B -> A [label = "t2 : A in s4 : {B in s4}"];
})


<!SLIDE>
The cycle will be ignored because segment 2 happens before segment 4.
