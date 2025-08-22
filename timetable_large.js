/**
 * PTV Timetable V3.0
 * Run on Scriptable For Large Widget
 * Created by Ricky Li on 2025/08/22
 * 
 * For instructions and report issues visit:
 * https://github.com/imchlorine/PTVTimetable.git
 * 
 * This Script is used for feching PTV timetable for routes between two stops
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
// Go PTV App or website to find stop name
// Make sure use the full name of the stop to get the most accurate result.

// Here is an example for Tram from "Melbourne University/Swanston St #1" to "Federation Square/Swanston St #13"
// Please change the content inside " " below to customize your PTV timetable. 

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
let allDepartures = await getStopServices()
let disruptions = await getDisruptions()
let directionIds = await getDirection()
let departures = getDepartures()
let widget = await createWidget(departures);
if (!config.runsInWidget) {
    await widget.presentLarge()
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
    gradient.locations = [0.0, 0.3, 0.45, 0.45]
    widget.backgroundGradient = gradient
    widget.setPadding(15, 20, 15, 20)

    let titleWidget = widget.addStack()
    titleWidget.bottomAlignContent()

    addSymbol({
        symbol: typeIcon,
        stack: titleWidget,
        size: 20
    })

    let df = new DateFormatter()
    df.useShortTimeStyle()
    let updated = df.string(new Date())
    addTextWithStyle({
        stack: titleWidget,
        text: " Last updated at " + updated,
        size: 12
    })

    titleWidget.addSpacer()

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

    widget.addSpacer(hasDisrupt ? 10 : 30)

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

    widget.addSpacer(hasDisrupt ? 5 : 35)

    if (hasDisrupt) {
        addTextWithStyle({
            stack: widget,
            text: "Disruptions: " + disruptions[0].label,
            size: 9,
            lineLimit: 2
        })

        widget.addSpacer(2)

        let link = widget.addStack()
        link.centerAlignContent()

        addTextWithStyle({
            stack: link,
            text: "READ MORE ",
            size: 8,
            url: "googlechrome://www.ptv.vic.gov.au" + disruptions[0].link
        })

        addSymbol({
            symbol: "arrow.up.right.square",
            stack: link,
            size: 10
        })
    }

    widget.addSpacer()
    widget.addSpacer(20)

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
        if (platText != undefined) lineWidget.addSpacer()

        addTextWithStyle({
            stack: lineWidget,
            text: platText ?? "",
            color: "#808080",
            size: 14
        })
        widget.addSpacer(2)

        let depWidget = widget.addStack();
        depWidget.topAlignContent()

        var scheduledTime = dep["scheduled_departure_utc"]
        var estimatedTime = dep["estimated_departure_utc"]
        let dateText = new Date(scheduledTime)
        let localTime = new Date(dateText)
        let depText = "Scheduled " + ("0" + localTime.getHours()).slice(-2) + ":" + ("0" + localTime.getMinutes()).slice(-2)
        addTextWithStyle({
            stack: depWidget,
            text: depText,
            color: "#000000",
            size: 18
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
            color: "#88BC41",
        })

        if (estimatedTime != null && time < 120)
            addSymbol({
                symbol: "dot.radiowaves.up.forward",
                stack: depWidget,
                size: 12,
                color: "#88BC41"
            })

        widget.addSpacer()
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
    size = 20,
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
    let departures = allDepartures.filter(d => directionIds.includes(d["direction_id"].toString()))
    return departures.slice(0, 3)
}

async function getDirection() {
    let directionIds = []
    let groupRoutes = Object.values(groupBy(allDepartures, (d) => d.route.id))
    for (let groupRoute of groupRoutes) {
        let groupDirections = groupBy(groupRoute, (d) => d["direction_id"])
        let keys = Object.keys(groupDirections)
        let numOfDirect = keys.length
        if (numOfDirect === 1) {
            directionIds.push(keys[0])
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
                directionIds.push(stopDepIndex < stopDesIndex ? keys[0] : keys[1])
            }
        }
    }
    return directionIds
}

function groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

async function getRoute() {
    let uri = `/routes?route_type=${routeType}`
    let result = await apiRequest(uri)
    let routesInBetween = getRoutesInBetween()
    let routes = result["routes"].filter((r) => routesInBetween.includes(r["short_label"]) || routesInBetween.includes(r["label"]));
    return routes
}

function getRoutesInBetween() {
    var depRoutes
    var desRoutes
    if (routeType === "0" || routeType === "3") {
        depRoutes = stopDep.lineNames
        desRoutes = stopDes.lineNames
    } else {
        depRoutes = stopDep.routeNumbers.map((function (num, idx) {
            return num + " " + stopDep.lineNames[idx];
        }))
        desRoutes = stopDes.routeNumbers.map((function (num, idx) {
            return num + " " + stopDes.lineNames[idx];
        }))
    }
    let routes = desRoutes.filter(element => depRoutes.includes(element))
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
    let uri = `/stop-services?stop_id=${stopDep.id}&mode_id=${routeType}&max_results=3&look_backwards=false`
    let result = await apiRequest(uri)
    return result["departures"].filter(dep => routeIds.includes(dep.route.id))
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

async function getDisruptions() {
    let uri = `/disruptions?`
    let result = await apiRequest(uri)
    return result["disruptions"].filter(d => d["route_ids"].filter(r => routeIds.includes(r)).length > 0 && d["kind"] === "Planned Works")
}

async function getToken() {
    let url = "https://raw.githubusercontent.com/imchlorine/PTVTimetable/refs/heads/main/token"
    let req = new Request(url)
    let result = await req.loadString()
    return result.replace('\n', '')
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