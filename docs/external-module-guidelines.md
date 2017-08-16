### Guidelines for Developing External Modules in REDCap

1. Module Naming
    1. [snake case](https://en.wikipedia.org/wiki/Snake_case), like most of the REDCap world.
    1. Pre-release versions are 0.  Production version are 1+.
    1. place the *major* version number in the name.  

    This is influenced by REDCap's feature that all deployments of an external module (in a single instance) must have the same version.  (This allows administrators to avoid dealing with every project for small projects.)

    If a module developer release big (and likely breaking) changes, it is seem as an independent/unrelated module by REDCap's update mechanism for modules.

    1. *Good* Examples
    ```
    retinal_scanner_0              # The pre-release version
    retinal_scanner_1              # The first release
    retinal_scanner_2              # Subsequent version w/ breaking changes
    ```

    1. *Bad* Examples
    ```
    retinal_scanner                 # No version number
    retinal_scanner_3.4             # Includes major and minor version
    retinalSCANNER2                 # Not snake case
    retinal-scanner-2               # Not snake case (dashes, not underscores)
    ```

1. Mark each GitHub repo with two [topics](https://github.com/blog/2309-introducing-topics): the [`redcap`](https://github.com/search?utf8=%E2%9C%93&q=topic%3Aredcap) and [`redcap-external-module`](https://github.com/search?utf8=???&q=topic%3Aredcap-external-module).

### Guidelines to possibly add in the future:
1. Suggested life cycle of a module, and how to best progress through it:
    1. private & project-specific
    1. private & generalizable to multiple projects
    1. public on GitHub (but not yet vetted by the consortium)
    1. public on the REDCap menu (after being vetted)
    1. subsequent updates (and the associated re-release and re-vetting)

1. Suggested editors & IDEs:
