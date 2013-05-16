<!SLIDE>
# The happens-before relation


<!SLIDE>
We can implement this relation by associating an identifier to segments of the
code that are separated by the start or join of a thread.


<!SLIDE>
When a thread starts another thread, both the parent and the child threads are
assigned new segment identifiers.


<!SLIDE>
When a thread joins another thread, the parent thread continues executing with
a new segment identifier.


<!SLIDE>
By drawing directed edges between the segments, we end up with a graph where
node `v` is reachable from node `u` iff `u` happens before `v`.


<!SLIDE>
If two acquires do not happen before the other, then they must surely happen
in parallel.


<!SLIDE graph_example segmentation_graph>
## Example \#8
`main` starts in segment 0

    @@@ cpp
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 [label = s0];
    }
})


<!SLIDE graph_example segmentation_graph>
## Example \#8
`main` starts `t1`; `main` and `t1` get new segments


    @@@ cpp
    thread t1([] {});
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
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


<!SLIDE graph_example segmentation_graph>
## Example \#8
`main` starts `t2`; `main` and `t2` get new segments

    @@@ cpp
    thread t1([] {});
    thread t2([] {
        // ...
    });
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main1 -> t20;
        t20 [label = s4];
    }
})


<!SLIDE graph_example segmentation_graph>
## Example \#8
`t2` starts `t3`; `t2` and `t3` get new segments

    @@@ cpp
    thread t1([] {});
    thread t2([] {
        thread t3([] {});
        // ...
    });
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main1 -> t20 -> t21;
        t20 [label = s4];
        t21 [label = s5];
    }
    subgraph cluster_t3 {
        label = "t3";
        t20 -> t30;
        t30 [label = s6];
    }
})


<!SLIDE graph_example segmentation_graph>
## Example \#8
`t2` joins `t3`; `t2` continues in a new segment

    @@@ cpp
    thread t1([] {});
    thread t2([] {
        thread t3([] {});
        t3.join();
    });
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main1 -> t20 -> t21 -> t22;
        t20 [label = s4];
        t21 [label = s5];
        t22 [label = s7];
    }
    subgraph cluster_t3 {
        label = "t3";
        t20 -> t30 -> t22;
        t30 [label = s6];
    }
})


<!SLIDE graph_example segmentation_graph>
## Example \#8
`main` joins `t1`; `main` continues in a new segment

    @@@ cpp
    thread t1([] {});
    thread t2([] {
        thread t3([] {});
        t3.join();
    });
    t1.join();
    // ...

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2 -> main3;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
        main3 [label = s8];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main3;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main1 -> t20 -> t21 -> t22;
        t20 [label = s4];
        t21 [label = s5];
        t22 [label = s7];
    }
    subgraph cluster_t3 {
        label = "t3";
        t20 -> t30 -> t22;
        t30 [label = s6];
    }
})


<!SLIDE graph_example source_code_230P segmentation_graph>
## Example \#8
`main` joins `t2`; `main` continues in a new segment

    @@@ cpp
    thread t1([] {});
    thread t2([] {
        thread t3([] {});
        t3.join();
    });
    t1.join();
    t2.join();

![](https://chart.googleapis.com/chart?cht=gv&chl=digraph {
    graph [bgcolor = transparent, splines = ortho];
    subgraph cluster_main {
        label = "main";
        main0 -> main1 -> main2 -> main3 -> main4;
        main0 [label = s0];
        main1 [label = s1];
        main2 [label = s3];
        main3 [label = s8];
        main4 [label = s9];
    }
    subgraph cluster_t1 {
        label = "t1";
        main0 -> t10 -> main3;
        t10 [label = s2];
    }
    subgraph cluster_t2 {
        label = "t2";
        main1 -> t20 -> t21 -> t22 -> main4;
        t20 [label = s4];
        t21 [label = s5];
        t22 [label = s7];
    }
    subgraph cluster_t3 {
        label = "t3";
        t20 -> t30 -> t22;
        t30 [label = s6];
    }
})
