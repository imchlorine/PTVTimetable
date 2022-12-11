# PTVTimetable
Fetch PTV Timetable with Scriptable, add to iOS Widget.    

- Fetch Myki Balance visit:  [MykiBalance](https://github.com/imchlorine/MykiBalance.git)

**Important! This Widget is not affiliated to PTV or Myki. For personal use only.**



## How to add PTVTimetable Widget to my iOS?

1. Download [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188?ign-mpt=uo%3D4) from App Store

2. Add new Script on Scriptable. You can choose to add `Medium` or `Large` Widget. And you can always duplicate and rename the Script to add multiple timetable for iOS Stack Widget

      - For Medium Widget
  
         Copy Everything in [timetable_medium.js](https://github.com/imchlorine/PTVTimetable/blob/main/timetable_medium.js) and paste to your new Script.

      - For Large Widget

         Copy Everything in [timetable_large.js](https://github.com/imchlorine/PTVTimetable/blob/main/timetable_large.js) and paste to your new Script.

      - What's the difference between `Medium` and `Large` Widget?

         Medium Widget is for someone who know exactly their route is, or they only wants to check one route at a time. Large Widget can show multiple routes between two stops. Generally, Large Widget needs more time to response as the code need more time to match all the routes avaliable.

3. Run the code, you can see an example preview of the timetable: the top one is `Medium`, the bottom one is `Large` <br /> 
   <p align="center" width="100%">
    <img width="33%" src="https://github.com/imchlorine/PTVTimetable/blob/main/examples.jpg">
   </p>


4. Change the value inside " " to customize your PTV timetable.
   
   `routeType`: Train `0` ,Tram `1`, Bus `2`, V/Line `3`, Night Bus `4` 

   `routeName`:(Not necessary for Large Widget)

    - Train: eg. `Alamein` or `Alamein Line`, `Belgrave` or `Belgrave Line`

    - Tram: Route number is ok, eg. `1`, `3-3a`, `96` etc. If not, try full name eg.`1 East Coburg South Melbourne Beach`
  
    - Bus:  Route number is ok, eg. `200`, `207`, `900` etc. If not, try full name eg.`200 City - Bulleen` 

    - V/Line: Must use route full name, eg. `Ballarat-Wendouree - Melbourne via Melton`
  
    - To search the route full name, please visit https://www.ptv.vic.gov.au/routes

   `fromStop`: Your Departure Stop Name. 
    - Train: eg. `Flinders Street Station`. Do not contain "Railway" if your route type is `0` for train.
  
    - Tram: eg. `Federation Square/Swanston St #13`
  
    - Bus: eg. `Caulfield Railway Station/Sir John Monash Dr`

    - V/Line: eg.  `Flinders Street Railway Station` Must contain "Railway" if your route type is `3` for V/Line.

    - Go PTV App or website to find stop name. Make sure use the full name of the stop to get the most accurate result.
   
   `toStop`: Your Arriving Stop Name.

5. Run the code again, you will see your timetable if all the values are valid and correct. (If something wrong, please report an issue with all the values you changed, and I will look into it for you)
   
6. Go to your Widgets library and find Scriptable, make sure pick the Middle/Large one and Add Widget to your home screen (Not support layout for Small Widget)

7. Long press the Widget and go Edit Widget. Choose the `Script` you Added, set `When Interacting` to `Run Script`, so you can manually update your timetable by tapping the widget, leave `Parameter` empty

8. Now you may see the Magic, Enjoy! 


## Here are some more examples preview:

| ![image1](https://github.com/imchlorine/PTVTimetable/blob/main/example/example1.jpg) | ![image2](https://github.com/imchlorine/PTVTimetable/blob/main/example/example2.jpg) | ![image3](https://github.com/imchlorine/PTVTimetable/blob/main/example/example3.jpg) | ![image4](https://github.com/imchlorine/PTVTimetable/blob/main/example/example4.jpg) |
|:---:|:---:|:---:|:---:|
|![image5](https://github.com/imchlorine/PTVTimetable/blob/main/example/example5.jpg) | ![image6](https://github.com/imchlorine/PTVTimetable/blob/main/example/example6.jpg) | ![image7](https://github.com/imchlorine/PTVTimetable/blob/main/example/example7.jpg) | ![image8](https://github.com/imchlorine/PTVTimetable/blob/main/example/example8.jpg) |
