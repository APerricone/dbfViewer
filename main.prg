#include "ultralight.ch"
#include <dbinfo.ch>

STATIC toolbar, main_view, nCurrentArea
#define TOOLBAR_HEIGHT 52

proc main(cFile)
    LOCAL app := ultralight_app():Create()
    LOCAL window := ultralight_window():Create(app:main_Monitor,600,600,.F.,ulWindowFlags_Titled + ulWindowFlags_Resizable + ulWindowFlags_Maximizable)
    window:title := "DBF Viewer"
    app:window := window
    window:bOnResize := @OnResize()
    toolbar:=ultralight_overlay():Create(window,window:width(),window:DeviceToPixels(TOOLBAR_HEIGHT),0,0)
    toolbar:view():LoadURL("file:///toolbar.html")
    toolbar:view():bOnChangeCursor := {|v,c| HB_SYMBOL_UNUSED(v), window:cursor := c}
    toolbar:view():bOnDOMReady = @OnToolbarReady()
    if !empty(cFile)
        OpenFile(,cFile)
    endif
    app:Run()

proc OpenFile(pthis,cFile)
    LOCAL y, nArea
    LOCAL window := ultralight_app():Instance():window
    HB_SYMBOL_UNUSED(pThis)
    if ValType(cFile)=="A"
        cFile := iif(len(cFile)>1,cFile[1],nil)
    endif
    if empty(cFile)
        cFile := tinyfd_openFileDialog("DBF Viewer - open file",,{"*.dbf"},"DBF table",.F.)
    endif
    if Empty(cFile)
        return
    endif
    USE (cFile) NEW
    nArea := Select()
    y := window:DeviceToPixels(TOOLBAR_HEIGHT)
    main_view := ultralight_overlay():Create(window,window:width(),window:height()-y,0,y)
    main_view:view():LoadURL("file:///table.html")
    main_view:view():bOnChangeCursor := {|v,c| HB_SYMBOL_UNUSED(v), window:cursor := c}
    main_view:view():bOnDOMReady = {|view| OnTableReady(view,nArea)}
    nCurrentArea := nArea

proc OnResize(w,h)
    LOCAL y,window := ultralight_app():Instance():window
    y := window:DeviceToPixels(TOOLBAR_HEIGHT)
    toolbar:Resize(w,y)
    if !empty(main_view)
        main_view:Resize(w,h-y)
    endif

proc ShowInfo()
    LOCAL app, popupWindow, overlay
    if empty(nCurrentArea)
        tinyfd_messageBox("DBF Viewer - info","no file opened","ok","info")
        return
    endif
    app := ultralight_app():Instance()
    // it crashes
    popupWindow :=  ultralight_window():Create(app:main_Monitor,200,600,.F.,ulWindowFlags_Titled)
    overlay := ultralight_overlay():Create(popupWindow,popupWindow:width(),popupWindow:height(),0,0)
    overlay:view():LoadURL("file:///info.html")
    overlay:view():bOnChangeCursor := {|v,c| HB_SYMBOL_UNUSED(v), popupWindow:cursor := c}
    overlay:view():bOnDOMReady = @OnInfoReady()

proc OnInfoReady(caller)
    LOCAL global
    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["GetStruct"] := {|| GetString(.T.)}
    global["CopyInfo"] := {|| GetString(.F.)}

func GetString(lCode)
    LOCAL i, aStruct := dbStruct()
    LOCAL cRet := ""
    if lCode
        cRet += "{"+hb_eol()
    endif
    for i:=1 to len(aStruct)
        if lCode
            cRet+="{"
            cRet+=PadL('"'+aStruct[i,1]+'"',12)+","
            cRet+='"'+aStruct[i,2]+'"'+","
            cRet+=str(aStruct[i,3],4)+","
            cRet+=str(aStruct[i,4],2)+"}"
            if(i!=len(aStruct))
                cRet+=","
            endif
            cRet+=hb_eol()
        else
            cRet+=PadL(aStruct[i,1],10)+"("
            cRet+=aStruct[i,2]+":"
            cRet+=str(aStruct[i,3],4)
            if aStruct[i,2]="N"
                cRet+="."+str(aStruct[i,3],2)
            endif
            cRet+=")"+hb_eol()
        endif
    next
return cRet

proc OnToolbarReady(caller)
    LOCAL global
    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["OpenFile"] := @OpenFile()
    //global["ShowInfo"] := @ShowInfo()

func getDBInfo()
    LOCAL dbInfo := {=>}, lastMod := LUpdate()
    dbInfo["version"] :=  dbInfo( DBI_DB_VERSION )
    dbInfo["year"] :=  Year(lastMod)
    dbInfo["month"] :=  Month(lastMod)
    dbInfo["day"] :=  Day(lastMod)
    dbInfo["nRecord"] := RecCount()
return dbInfo

proc OnTableReady(caller,nArea)
    LOCAL global
    dbSelectArea(nArea)

    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["getRows"] := {|this,args| HB_SYMBOL_UNUSED(this), askRows(global["onRow"],nArea,args[1],args[2],args) }
    global["setOrder"] := {|this,args| HB_SYMBOL_UNUSED(this), setOrder(nArea,args[1])}
    // init the view
    global["header"]:CallNoThis(getDBInfo(),dbStruct())

proc setOrder(nArea,nColumn)
    LOCAL cCode
    dbSelectArea(nArea)
    ordDestroy("TMP_VIEWER")
    if(nColumn>0)
        cCode := FieldName(nColumn)
        INDEX ON &(cCode) TAG "TMP_VIEWER" TEMPORARY
    endif

proc askRows(pCallback,nArea,nMin,nCount) //,args)
    LOCAL i, j, data := {}
    //? "askedRow",nArea,nMin,nMax,args[3],args[4]
    dbSelectArea(nArea)
    dbGoto(nMin)
    for i:=1 to nCount
        data := {}
        //? "sending row",recno()
        for j:=1 to FCount()
            aAdd(data,FieldGet(j))
            //?? FieldGet(i)
        next
        pCallback:CallNoThis(recno(),data,Deleted())
        dbSkip()
    next
