#include "ultralight.ch"

STATIC toolbar
#define TOOLBAR_HEIGHT 52

proc main(cFile)
    LOCAL app := ultralight_app():Create()
    LOCAL window := ultralight_window():Create(app:main_Monitor,300,300,.F.,ulWindowFlags_Titled + ulWindowFlags_Resizable + ulWindowFlags_Maximizable)
    window:title := "DBF Viewer"
    app:window := window
    window:bOnResize := @OnResize()
    toolbar:=ultralight_overlay():Create(window,window:width(),window:DeviceToPixels(TOOLBAR_HEIGHT),0,0)
    toolbar:view():LoadURL("file:///toolbar.html")
    toolbar:view():bOnChangeCursor := {|v,c| window:cursor := c}
    toolbar:view():bOnDOMReady = @OnDOMReady()
    app:Run()

proc OpenFile()
    LOCAL cSelectedFile := tinyfd_openFileDialog("DBF Viewer - open file",,{"*.dbf"},"DBF table",.F.)

proc OnResize(w,h)
    LOCAL window := ultralight_app():Instance():window
    toolbar:Resize(w,window:DeviceToPixels(TOOLBAR_HEIGHT))

proc OnDOMReady(caller)
    LOCAL global
    ///
    /// Set our View's JSContext as the one to use in subsequent JSHelper calls
    ///
    SetJSContext(caller:LockJSContext())
    global := JSGlobalObject()
    global["OpenFile"] := @OpenFile()

