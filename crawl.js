const request = require("request")
const fs = require("fs")
// home_id, movies_id, news_id, webseries_id, tv_id, music_id, sports_id, buzz_id
const id = [
    "87c3ddc974dcf12294e9412bec44b097",
    "08f8fce450d1ecf00efa820f611cf57b",
    "5f15a7356cf9dfceeb355fc49dd2be8a",
    "7694f56f59238654b3a6303885f9166f",
    "feacc8bb9a44e3c86e2236381f6baaf3",
    "72d9820f7da319cbb789a0f8e4b84e7e",
    "6256019abbad655653afffa3056345a1",
    "4e82d34404a477419f811cd303e216e7&userid=ff194622-b26c-4388-b546-88351dfe37fb"

];

const file = fs.createWriteStream("data.csv");

var section_url = "https://api.mxplay.com/v1/web/home/tab/";
var list_url = "https://api.mxplay.com/v1/web/list/";

var get_section_content = function(section_id, next_ref) {
    console.log("get_section_content: ", section_id, next_ref);
    if (next_ref == null) {
        return;
    }
    url = list_url + section_id + "?" + next_ref;
    console.log("current_url : " + url);
    request({url: url, json : true}, function(error, response, body) { 
        if (body['items'] != null) {
            for (const item of body['items']) {
                var content = item['title'] + ","  + item['type'] + "," + (item['publisher'] != null ? item['publisher']['name'] : "") + "," + item['webUrl'] + "\n";
                file.write(content, (err) => {
                    if (err) throw err;
                    // console.log('data saved in file'); 
                });
            }
        }
        if (body['next'] != null) {
            get_section_content(section_id, body['next']);
        }
    })
}

var load_sections = function(next_ref, tab_id) {
    next_url = (next_ref != null ? section_url + tab_id + "?" + next_ref : section_url + tab_id);
    console.log("sending next_url request : " + next_url);
    request({url : next_url, json: true}, function (error, response, body) {
        console.log("StatusCode : " + response.statusCode);
        if (error || response.statusCode != 200) {
            console.log("Error: " + error + " statuscode: " + response.statusCode);
            return;
        }
        for (const section_info of body['sections']) {
            console.log('section_info : ' + section_info['id']);
            get_section_content(section_info['id'], section_info['next']);
        }
        if (body['next'] != null) {
            load_sections(body['next'], tab_id);
        }
    })
}

// one way:
for (var i = 0; i < id.length; ++i) {
    load_sections(null, id[i]);
}

// other way:
// save file for each tabs : <file-name><number>.csv just to create a pattern
// use cat <file-name-pattern>*.csv >> concatenated.csv where '>>' with cat appends in file.
