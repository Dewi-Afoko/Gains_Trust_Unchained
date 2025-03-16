
- Styling inconsistencies very noticeable while using
- Add confirmation to skip set button informing user it'll be moved to end of workout
- Exploit radix more. More tooltips, etc. Less info just there.



- PASSWORD RECOVERY!

- Refactor Toasts for workout complete
    - Redesign how mark complete buttons work/appear based on whether they can be used
    - More feedback that you must start a workout


- Can timer countdown provide sound/visuals while tabbed?

- Overview ticker truncates after 2.5 exercises


- Create Workout --> Add an Exercise --> How many sets? --> Rest betwwen sets? --> Add a drop set? (Y/N)
    - After creation, ask "How long does it take to set up the equipment for this exercise?" and "How long does it take you to set up after a rest for this exercise?
       - Use the former to determine rest interval between final set of previous exercise and first of next – excluding Super Sets.
       - Add a third state between timers for "setup period", big animation transitioning to it and away from it.

- "Ready Up" for new exercise
- Refactor set duration
    - Ready button
    - Pause workout button
        - Advanced metrics (programmed rest time vs. actual rest time)
        - Include Set Up time for sets?
            - Give user that long before set duration begins?

- Tickbox to attach weight to workouts.
    - Allow user to submit a new weight through pop-up and attach that.
    - Warn users if they haven't logged their weight in the last 10 days. (Behaviour disabled by default as potentially bad for some people.)