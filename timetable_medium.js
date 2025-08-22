/**
 * PTV Timetable V3.0
 * Run on Scriptable For Large Widget
 * Created by Ricky Li on 2025/08/22
 * 
 * For instructions and report issues visit:
 * https://github.com/imchlorine/PTVTimetable.git
 * 
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

// [routeName] Can be Train line, Tram route, Bus route, V/Line route
// Train: eg. "Alamein" or "Alamein Line", "Belgrave" or "Belgrave Line" etc.
// Bus:  Route number is ok, eg. "200", "207", "900" etc. If not, try full name eg."200 East Coburg - South Melbourne Beach"
// Tram: Route number is ok, eg. "1", "3-3a", "96" etc. If not, try full name eg."1 East Coburg - South Melbourne Beach"
// V/Line: Must use route full name, eg. "Ballarat-Wendouree - Melbourne via Melton". 
// To search the route full name, please visit https://www.ptv.vic.gov.au/routes 

// [fromStop] Your Departure Stop Name
// [toStop] Your Arriving Stop Name
// Go PTV App or website to find stop name.
// Go PTV App or website to find stop name
// Make sure use the full name of the stop to get the accurate result.

// Here is an example for Tram Route 1 from "Melbourne University/Swanston St #1" to "Federation Square/Swanston St #13"
// Please change the content inside " " below to customize your PTV timetable. 

const routeType = "1"
const routeName = "1"
const fromStop = "Melbourne University/Swanston St #1"
const toStop = "Federation Square/Swanston St #13"

// ================================
// ================================
// Do not edit the code below
const baseURL = "https://www.ptv.vic.gov.au/lithe";
let token = await getToken()
let stopDep = await searchStop(fromStop)
let stopDes = await searchStop(toStop)
let route = await getRoute()
let allDepartures = await getStopServices()
let disruptions = await getDisruptions(route.id)
let directionId = await getDirection()
let departures = getDepartures()
let widget = await createWidget(departures);
if (!config.runsInWidget) {
    await widget.presentMedium()
}
Script.setWidget(widget)
Script.complete()

async function createWidget(departures) {
    let typeColor = getRouteColor(routeType)
    let typeIcon = getRouteSymb(routeType)
    let hasDisrupt = disruptions.length > 0
    let widget = new ListWidget()
    let startColor = new Color(typeColor)
    let thenColor = new Color("333434")
    let midColor = new Color("333434")
    let endColor = new Color("#ffffff")
    let gradient = new LinearGradient()
    gradient.colors = [startColor, thenColor, midColor, endColor]
    gradient.locations = [0.0, 0.3, 0.51, 0.51]
    widget.backgroundGradient = gradient
    widget.addSpacer()

    let titleWidget = widget.addStack()
    titleWidget.centerAlignContent()
    addSymbol({
        symbol: typeIcon,
        stack: titleWidget,
        size: 14
    })
    titleWidget.addSpacer(10)

    let df = new DateFormatter()
    df.useShortTimeStyle()
    let updated = df.string(new Date())
    addTextWithStyle({
        stack: titleWidget,
        text: "Updated at " + updated,
        size: 10
    })

    titleWidget.addSpacer()

    if (hasDisrupt) {
        addTextWithStyle({
            stack: titleWidget,
            text: "Disruptions",
            size: 10,
            color: "#F9D748",
            url: "googlechrome://www.ptv.vic.gov.au" + disruptions[0].link
        })
        addSymbol({
            symbol: "arrow.up.right.square",
            stack: titleWidget,
            size: 10,
            color: "#F9D748"
        })
    }

    widget.addSpacer(5)
    addTextWithStyle({
        stack: widget,
        text: fromStop,
        size: 18
    })

    widget.addSpacer(2)

    addTextWithStyle({
        stack: widget,
        text: "to " + toStop,
        size: 16
    })

    widget.addSpacer(15)

    addTextWithStyle({
        stack: widget,
        text: "Route " + route.label,
        color: typeColor,
        size: 12
    })
    widget.addSpacer(5)

    let routeWidget = widget.addStack();
    routeWidget.addSpacer(10);

    for (const dep of departures) {
        let depWidget = widget.addStack();
        var platText = dep["platform_number"]
        if (platText != null) platText = "Platform " + platText;

        addTextWithStyle({
            stack: depWidget,
            text: platText ?? "",
            color: "#000000"
        })
        if (platText != null) depWidget.addSpacer(20)

        var scheduledTime = dep["scheduled_departure_utc"]
        var estimatedTime = dep["estimated_departure_utc"]
        let dateText = new Date(scheduledTime)
        let localTime = new Date(dateText)
        let depText = "Scheduled " + ("0" + localTime.getHours()).slice(-2) + ":" + ("0" + localTime.getMinutes()).slice(-2)
        addTextWithStyle({
            stack: depWidget,
            text: depText,
            color: "#000000"
        })
        depWidget.addSpacer(15)

        let isExpress = dep.run["express_stop_count"]
        addTextWithStyle({
            stack: depWidget,
            text: isExpress > 0 ? "EXPRESS" : "",
            color: "#88BC41",
        })

        depWidget.addSpacer()

        var minText = "";
        let dif = new Date(estimatedTime ?? scheduledTime).getTime() - new Date().getTime();
        let time = Math.round(dif / 60000)
        let min = time == 1 ? " min" : " mins"
        if (time < 120) minText = time + min
        if (time === 0) minText = "Now"
        if (estimatedTime === null) minText = ""
        if (new Date().toDateString() != localTime.toDateString()) {
            let df = new DateFormatter()
            df.useMediumDateStyle()
            minText = df.string(localTime).slice(0, -4)
        }

        addTextWithStyle({
            stack: depWidget,
            text: minText,
            color: "#88BC41"
        })
        if (estimatedTime != null && time < 120)
        addSymbol({
            symbol: "dot.radiowaves.up.forward",
            stack: depWidget,
            size: 12,
            color: "#88BC41"
        })

        widget.addSpacer(5)
    }

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
    size = 14,
    color = "#ffffff",
    url = undefined,
    lineLimit = 1
}) {
    const textwidget = stack.addText(text)
    textwidget.textColor = new Color(color)
    textwidget.font = new Font("AppleSDGothicNeo-Bold", size)
    textwidget.lineLimit = lineLimit
    if (url != undefined) textwidget.url = url
    return textwidget
}

function getDepartures() {
    let departures = allDepartures.filter(departure => departure["direction_id"].toString() === directionId)
    return departures
}

async function getDirection() {
    let groupDirections = groupBy(allDepartures, (d) => d["direction_id"])
    let keys = Object.keys(groupDirections)
    let numOfDirect = keys.length
    if (numOfDirect === 1) {
        return keys[0]
    } else {
        var stopSeq = []
        try {
            stopSeq = await getStopSeq(routeType, groupDirections[keys[0]][0].route.id, keys[0])
        } catch (e) {
            console.error(e)
        }
        if (stopSeq.length > 0) {
            let stopDepIndex = stopSeq.findIndex(stop => stop.id === stopDep.id)
            let stopDesIndex = stopSeq.findIndex(stop => stop.id === stopDes.id)
            if (stopDepIndex < stopDesIndex) return keys[0]
            return keys[1]
        }
    }
}

function groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

async function getRoute() {
    let uri = `/routes?route_type=${routeType}`
    let result = await apiRequest(uri)
    let routes = result["routes"].filter((r) => r["short_label"] === routeName);
    if (routes.length === 1) {
        return routes[0]
    } else {
        let route = result["routes"].find((r) => r["label"] === routeName)
        return route
    }
}

async function searchStop(stopName) {
    let queryName = encodeURIComponent(stopName)
    let uri = `/search?term=${queryName}&mode=home&`
    let result = await apiRequest(uri)
    // Why PTV API return data type is not consistent??????????????
    var stops = result["results"]["stop"]
    if (Array.isArray(stops)) {
        stops = result["results"]["stop"][0]
    } else {
        stops = result["results"]["stop"][routeType]
    }
    let stop = stops.find(stop => stop.label === stopName)
    if (stop === undefined)
        stop = stops[0]
    return stop
}

async function getStopServices() {
    let uri = `/stop-services?stop_id=${stopDep.id}&route_id=${route.id}&mode_id=${routeType}&max_results=2&look_backwards=false`
    let result = await apiRequest(uri)
    return result["departures"].filter(dep => route.id === dep.route.id)
}

async function getStopSeq(routeType, routeId, directionId) {
    let utcTime = new Date().getUTCDate()
    let uri = `/route-stops?route_type=${routeType}&route_id=${routeId}&direction_id=${directionId}`
    let result = await apiRequest(uri)
    return result["stops_pattern"]
}

function getDirectionIdFromDes(depId, desId, depSeq, desSeq) {
    if (depSeq["seqs"][depId] < desSeq["seqs"][desId]) return depSeq["directions"]
    return desSeq["directions"]
}

async function getDisruptions(routeId) {
    let uri = `/disruptions?`
    let result = await apiRequest(uri)
    return result["disruptions"].filter(d => d["route_ids"].includes(routeId) && d["kind"] === "Planned Works")
}

async function getToken() {
    let url = "https://raw.githubusercontent.com/imchlorine/PTVTimetable/refs/heads/main/token"
    let req = new Request(url)
    let result = await req.loadString()
    return result.replace("\n","")
}

async function apiRequest(uri) {
    let encodedUri = encodeURI(uri)
    let url = baseURL + encodedUri
    let req = new Request(url)
    req.method = "GET"
    let defaultHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    }
    authHeader = { "X-Ptv-Token": token}
    req.headers = {
        ...defaultHeaders,
        ...authHeader
    }
    let result = await req.loadString()
    let jsonResult = JSON.parse(result)
    return jsonResult
}