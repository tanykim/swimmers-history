library(RCurl)
library(XML)
library(stringr)
library(jsonlite)

# Get the list of major swimming events
# Olympics (Every 4-th years: from 2000, meetType 1)
# World Championships (Every odd years: meetType 2)
# European Championships (Every even years: meetType 3)
# Commonwealth Games (Every non-olympic 4-th years: 2006, 2010, 2014: meetType 5)
# Pan Pacific Championships (Every non-olympic 4-th years: 2006, 2010, 2014: meetType 7450054)

# get meet info for data generation with python and visualization of webapp 
meetTypes <- c('1', '2', '3', '5', '7450054')
meetList <- list()
meetIdsAll <- c()

for (mt in meetTypes) {
  # Olympics
  print(mt)
  html <- getURL(paste("https://www.swimrankings.net/index.php?page=meetSelect&selectPage=BYTYPE&nationId=0&meetType=", mt, sep=""))
  doc <- htmlParse(html, asText=TRUE)

  # check data quality
  qualities <- xpathSApply(doc, "//td[@class='name']/img", xmlGetAttr, 'src')[1:10]
  hasQuality <- c()
  for (q in qualities) {
    hasQuality <- c(hasQuality, str_detect(q, '5')) #meetQuality5.png is the indicator 
  }
  count <- sum(hasQuality) + 1
  print (count)

  # Get meet ids -- roughly cut 10 events
  links <- xpathSApply(doc, "//td[@class='name']/a", xmlGetAttr, 'href')[1:count]
  meetIds <- c()
  for (link in links) {
    id <- unlist(str_split(link, "="))[3]
    meetIds <- c(meetIds, id)
  }
  
  # Get meet info
  meets <- xpathSApply(doc, "//table[@class='meetSearch']/tr", xmlValue)[2:count]
  for (i in 1:length(meets)) {
    meet <- meets[i]
    year <- str_extract(meet, "(1|2)[0-9]{3}")
    print (as.integer(year))
    
    if ((as.integer(year) >= 2000) == TRUE) {
      # Append meet id to all meet ids
      meetIdsAll <- c(meetIdsAll, meetIds[i])
      
      # meetList obj
      remains <- unlist(str_split(meet, "50m"))[2]
      location <- str_extract(remains, "^.*\\([A-Z]*\\)")
      location <- str_replace(location, "\u00a0", " ")
      name <- str_trim(unlist(str_split(remains, "\\)"))[2])
      print(name)
      print(meetIds[i])
      meetList[meetIds[i]] <- list(list(type = as.character(mt), year = year, location = location, name = name))   
    }
  }  
}

# connect HTML pages and parse contents, later used in python
genders <- c(1, 2)
styles <- list( '1' <- c(1, 2, 3, 5, 8, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40),
                '2' <- c(1, 2, 3, 5, 6, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40))

for (meet in meetIdsAll) {
  for (gender in genders) {
    for (style in unlist(styles[gender])) {
      
      #do only valid meet id
      if (!is.null(meetList[[meet]])) {
        url <- paste("https://www.swimrankings.net/index.php?page=meetDetail&meetId=",
                     meet, 
                     "&gender=",
                     gender,
                     "&styleId=",
                     style, sep="")
        html <- getURL(url)
        doc <- htmlParse(html, asText=TRUE)
        
        #save only accessible sites
        if (xpathSApply(doc, "//p", xmlValue)[1] == "You need a valid Swimrankings account in order to access this site.") {
          #remove meet list
          meetList[meet] = NULL
          print(c('not accessible', meet))
        } else {
          fileName <- paste("../python/R_results/", meet, "-", gender, "-", style, ".html", sep="")
          sink(fileName)
          print(doc, type='html')
          sink()
          print(fileName)        
        }
      }
    }
  }
}

# save as json file
write(toJSON(meetList), "../python/R_results/meets2.json")  
