# PTVTimetable
Fetch PTV Timetable with Scriptable, add to iOS Widget.    

- Fetch Myki Balance visit:  [MykiBalance](https://github.com/imchlorine/MykiBalance.git)

**Important! This Widget is not affiliated to PTV or Myki. For personal use only.**


## How to add PTVTimetable Widget to my iOS?

1. Download [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188?ign-mpt=uo%3D4) from App Store

2. Add new Script on Scriptable. You can choose to add `Medium` or `Large` Widget. And you can always duplicate and rename the Script to add multiple timetable for iOS Stack Widget

      - For Medium Widget
  
         Copy Everything in [timetable_medium.js](https://github.com/imchlorine/PTVTimetable/blob/main/ptv_timetable.js) and paste to your new Script.

      - For Large Widget

         Copy Everything in [timetable_large.js](https://github.com/imchlorine/PTVTimetable/blob/main/ptv_timetable.js) and paste to your new Script.

      - What's the difference between `Medium` and `Large` Widget?

         Medium Widget is for someone who know exactly their route is, or they only wants to check one route at a time. Large Widget can show multiple routes between two stops.Generally, Large Widget need more time to response then Medium Widget as the code need more time to match all the routes avaliable.

3. Run the code, you can see an example preview of the timetable: the top one is `Medium`, the bottom one is `Large` <br /> 
   ![example](https://github.com/imchlorine/PTVTimetable/blob/main/example.jpg)

4. Change the value inside " "  for  `routeType`, `routeName`(routeName is not necessary for Large Widget), `fromStop`, `toStop` to customize your PTV timetable. Run the code again, you will see your timetable if all the values are valid and correct

5. Go to your Widgets library and find Scriptable, make sure pick the Middle/Large one and Add Widget to your home screen (Not suport layout for Small and Large Widget)

6. Long press the Widget and go Edit Widget. Choose the `Script` you Added, set `When Interacting` to `Run Script`, so you can manually update your timetable by tapping the widget, leave `Parameter` empty

7. Now you may see the Magic, Enjoy! If something wrong, please report an issue with all the values you changed, and I will look into it for you.

