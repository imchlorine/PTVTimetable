/**
 * PTV Timetable V1.0
 * Run on Scriptable For Large Widget
 * Created by Ricky Li on 2022/12/09
 * https://github.com/imchlorine/PTVTimetable.git
 * This Script is used for feching PTV timetable for specific route
 * You can always duplicate this Script to add multiple timetable for iOS Stack Widget
 * 
 * For fetching Myki Balance Widget visit:
 * https://github.com/imchlorine/MykiBalance.git
 * 
 * 
 * Important! This Widget is not affiliated to PTV or Myki. For personal use only.
 */

// =============================
// [routeType] All the options from below
// Train: 0
// Tram: 1
// Bus: 2
// Vline: 3
// Night Bus: 4

// [fromStop] Your Departure Stop Name
// [toStop] Your Arriving Stop Name
// Go PTV App or website to find stop name.

// Here is an example for Tram Route 1 from "Melbourne University/Swanston St #1" to "Federation Square/Swanston St #13"
// Please change the value inside " " below to customize your PTV timetable. 

const routeType = "1"
const fromStop = "Melbourne University/Swanston St #1"
const toStop = "Federation Square/Swanston St #13"




// ================================
// ================================
// Do not edit the code below
const baseURL = "https://www.ptv.vic.gov.au/lithe";
let token = await getToken()
let stopDep = await searchStop(fromStop)
let stopDes = await searchStop(toStop)
let routes = await getRoute()
let routeIds = routes.map(r => r.id)
let services = await getStopServices()
let disruptions = await getDisruptions()
let directions = await getDirection()
let departures = getDepartures(directions)
let widget = await createWidget(departures);
if (!config.runsInWidget) {
    await widget.presentLarge()
}
Script.setWidget(widget)
Script.complete()


function getRoutesInBetween() {
    var depRoutes
    var desRoutes
    if (routeType === "0" || routeType === "3") {
        depRoutes = stopDep.lineNames
        desRoutes = stopDes.lineNames
    } else {
        depRoutes = stopDep.routeNumbers
        desRoutes = stopDes.routeNumbers
    }
    let routes = desRoutes.filter(element => depRoutes.includes(element))
    return routes
}


async function createWidget(departures) {
    let typeColor = getRouteColor(routeType)
    let typeIcon = getRouteSymb(routeType)
    let hasDisrupt = disruptions.length > 0
    let widget = new ListWidget()
    let startColor = new Color(getRouteColor(routeType))
    let thenColor = new Color("333434")
    let midColor = new Color("333434")
    let endColor = new Color("#ffffff")
    let gradient = new LinearGradient()
    gradient.colors = [startColor, thenColor, midColor, endColor]
    gradient.locations = [0.0, 0.3, 0.41, 0.41]
    widget.backgroundGradient = gradient
    widget.setPadding(15, 20, 15, 20)

    let titleWidget = widget.addStack()
    addSymbol({
        symbol: typeIcon,
        stack: titleWidget,
        size: 20
    })
    titleWidget.addSpacer()
    titleWidget.bottomAlignContent()
    addTextWithStyle({
        stack: titleWidget,
        text: "PT",
        size: 18
    })
    addTextWithStyle({
        stack: titleWidget,
        text: ">",
        color: "#C83C2D",
        size: 22
    })
    widget.addSpacer(hasDisrupt ? 10 : 20)
    addTextWithStyle({
        stack: widget,
        text: fromStop,
        size: 25
    })
    addTextWithStyle({
        stack: widget,
        text: "to " + toStop,
        size: 20
    })
    widget.addSpacer(hasDisrupt ? 0 : 30)
    if (hasDisrupt) {
        addTextWithStyle({
            stack: widget,
            text: "Disruptions: " + disruptions[0].label,
            size: 8,
            lineLimit: 2
        })
        widget.addSpacer(2)
        let link = widget.addStack()
        link.centerAlignContent()
        addTextWithStyle({
            stack: link,
            text: "MORE DISRUPTIONS ",
            size: 8,
            url: "googlechrome://www.ptv.vic.gov.au/disruptions/disruptions-information"
        })
        addSymbol({
            symbol: "arrow.up.right.square",
            stack: link,
            size: 10
        })
    }

    widget.addSpacer()
    widget.addSpacer(10)
    for (const dep of departures) {
        let lineWidget = widget.addStack()
        addTextWithStyle({
            stack: lineWidget,
            text: "Route " + dep.route.label,
            color: "#808080",
            size: 14
        })
        lineWidget.addSpacer(10)
        lineWidget.centerAlignContent()
        let isExpress = dep.run["express_stop_count"]

        addTextWithStyle({
            stack: lineWidget,
            text: isExpress > 0 ? "EXPRESS" : "",
            color: "#88BC41",
            size: 10
        })
        var platText = dep["platform_number"]
        if (platText != null) platText = "Platform " + platText;
        if (platText != undefined)
            lineWidget.addSpacer()
        addTextWithStyle({
            stack: lineWidget,
            text: platText ?? "",
            color: "#808080",
            size: 14
        })
        widget.addSpacer(2)
        let depWidget = widget.addStack();
        var scheduledTime = dep["scheduled_departure_utc"]
        var estimatedTime = dep["estimated_departure_utc"]
        var minText = "";
        let dif = new Date(estimatedTime ?? scheduledTime).getTime() - new Date().getTime();
        let time = Math.round(dif / 60000)
        let min = time == 1 ? " min" : " mins"
        minText = time + min
        let dateText = new Date(scheduledTime)
        let localTime = new Date(dateText)
        if (new Date().toDateString() != localTime.toDateString()) {
            let df = new DateFormatter()
            df.useMediumDateStyle()
            minText = df.string(localTime).slice(0, -4)
        }
        if (time < 120) minText = time + min
        if (time === 0) minText = "Now"
        let depText = "Scheduled " + ("0" + localTime.getHours()).slice(-2) + ":" + ("0" + localTime.getMinutes()).slice(-2)
        addTextWithStyle({
            stack: depWidget,
            text: depText,
            color: "#000000"
        })
        depWidget.addSpacer()

        addTextWithStyle({
            stack: depWidget,
            text: minText,
            color: "#88BC41",
        })
        widget.addSpacer()
    }
    let df = new DateFormatter()
    df.useShortTimeStyle()
    let updated = df.string(new Date())

    addTextWithStyle({
        stack: widget,
        text: "Last updated at " + updated,
        size: 12,
        color: "#000000"
    })

    widget.addSpacer()
    return widget
}

function getRouteColor(routeType) {
    var color = ""
    switch (routeType) {
        case "0":
            color = "#3070C7"
            break;
        case "1":
            color = "#88BC41"
            break;
        case "2":
            color = "#EF8933"
            break;
        case "3":
            color = "#832690"
            break;
        case "4":
            color = "#ffffff"
            break;
        default:
            color = "#ffffff"
            break;
    }
    return color;
}

function getRouteSymb(routeType) {
    var icon = "tram"
    switch (routeType) {
        case "0":
        case "3":
            icon = "tram.fill"
            break;
        case "1":
            icon = "tram"
            break;
        case "2":
        case "4":
            icon = "bus"
            break;
        default:
            icon = "tram"
            break;
    }
    return icon;
}

function addSymbol({
    stack,
    symbol = 'applelogo',
    color = "#ffffff",
    size = 20,
}) {
    const _sym = SFSymbol.named(symbol)
    const wImg = stack.addImage(_sym.image)
    wImg.tintColor = new Color(color)
    wImg.imageSize = new Size(size, size)
}

function addTextWithStyle({
    stack,
    text,
    size = 20,
    color = "#ffffff"
}) {
    const textwidget = stack.addText(text)
    textwidget.textColor = new Color(color)
    textwidget.font = new Font("AppleSDGothicNeo-Bold", size)
    return textwidget
}

function getDepartures(directions) {
    let directionIds = directions.map(d => d["direction_id"])
    let departures = services["departures"].filter(departure => directionIds.includes(departure["direction_id"]))
    return departures.slice(0, 3)
}

async function getDirection() {
    let allDirections = Object.values(services["directions"])
    let directionsInBetween = allDirections.filter(dir => routeIds.includes(dir["route_id"]))
    let directions = []
    for (let direct of directionsInBetween) {

        let stopSeq = []
        try {
            stopSeq = await getStopSeq(routeType, direct["route_id"], direct["direction_id"])
        } catch (e) {
            console.error(e)
        }
        if (stopSeq.length > 0) {
            let stopDepIndex = stopSeq.findIndex(stop => stop.id === stopDep.id)
            let stopDesIndex = stopSeq.findIndex(stop => stop.id === stopDes.id)
            if (stopDepIndex < stopDesIndex) directions.push(direct)
        }
    }
    return directions
}

async function getRoute() {
    let uri = `/routes?route_type=${routeType}&`
    let result = await apiRequest(uri)
    let routesInBetween = getRoutesInBetween()
    let routes = result["routes"].filter((r) => routesInBetween.includes(r["short_label"]));
    return routes
}

async function searchStop(stopName) {
    let queryName = encodeURIComponent(stopName)
    let uri = `/search?term=${queryName}&mode=home&`
    let result = await apiRequest(uri)
    // Why PTV API return data type is not consistent??????????????
    let stop = result["results"]["stop"]
    if (Array.isArray(stop)) {
        return result["results"]["stop"][0][0]
    }
    return result["results"]["stop"][routeType][0]
}

async function getStopServices() {
    let uri = `/stop-services?stop_id=${stopDep.id}&mode_id=${routeType}&max_results=4&look_backwards=false&`
    let result = await apiRequest(uri)
    return result
}

async function getStopSeq(routeType, routeId, directionId) {
    let utcTime = new Date().getUTCDate()
    let uri = `/route-stops?route_type=${routeType}&route_id=${routeId}&direction_id=${directionId}&`
    let result = await apiRequest(uri)
    return result["stops_pattern"]
}

function getDirectionIdFromDes(depId, desId, depSeq, desSeq) {
    if (depSeq["seqs"][depId] < desSeq["seqs"][desId]) return depSeq["directions"]
    return desSeq["directions"]
}

async function getDisruptions() {
    let uri = `/disruptions?`
    let result = await apiRequest(uri)
    return result["disruptions"].filter(d => d["route_ids"].includes(routeIds[0]) && d["kind"] === "Planned Works")
}

async function getToken() {
    let url = "https://www.ptv.vic.gov.au"
    let req = new Request(url)
    let result = await req.loadString()
    let token = result.match(/"fetch-key" value="([^"]+)"/)[1]
    return token
}

async function apiRequest(uri) {
    let encodedUri = encodeURI(uri)
    let url = baseURL + encodedUri + `__tok=${token}`
    let req = new Request(url)
    let result = await req.loadString()
    let jsonResult = JSON.parse(result)
    return jsonResult
}