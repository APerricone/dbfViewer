#include "ultralight.ch"

STATIC toolbar, main_view
#define TOOLBAR_HEIGHT 52

proc main(cFile)
    LOCAL app := ultralight_app():Create()
    LOCAL window := ultralight_window():Create(app:main_Monitor,300,300,.F.,ulWindowFlags_Titled + ulWindowFlags_Resizable + ulWindowFlags_Maximizable)
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


proc OnResize(w,h)
    LOCAL y,window := ultralight_app():Instance():window
    y := window:DeviceToPixels(TOOLBAR_HEIGHT)
    toolbar:Resize(w,y)
    if !empty(main_view)
        main_view:Resize(w,h-y)
    endif

proc OnToolbarReady(caller)
    LOCAL global
    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["OpenFile"] := @OpenFile()

proc OnTableReady(caller,nArea)
    LOCAL global, aTableInfo := {}, aStruct
    LOCAL i

    dbSelectArea(nArea)
    aStruct := dbStruct()
    for i:=1 to len(aStruct)
        aAdd(aTableInfo,{"name"=>aStruct[i,1],"type"=>aStruct[i,2],"len"=>aStruct[i,3],"dec"=>aStruct[i,4] })
    next

    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["header"]:CallNoThis(aTableInfo)
