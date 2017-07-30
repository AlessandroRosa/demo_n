if ( typeof is_array != "function" ) function is_array( _a ) 		 { return _a instanceof Array ? 1 : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }
if ( typeof safe_int != "function" ) function safe_int( _val, _set_if_nan ) { _val = parseInt( _val, 10 ); return isNaN( _val ) ? ( isNaN( _set_if_nan ) ? 0 : _set_if_nan ) : _val ; }
if ( typeof safe_float != "function" ) function safe_float( _val, _set_if_nan ) { _val = parseFloat( _val ); return isNaN( _val ) ? ( isNaN( _set_if_nan ) ? 0 : _set_if_nan ) : _val ; }
if ( typeof safe_string != "function" ) function safe_string( _obj, _default_str ) { return ( typeof _obj == "string" || _obj instanceof String ) ? new String( _obj ).trim() : new String( _default_str + "" ).trim() ; }

function demo_n( _dev_mode )
{
   this.timeoutid = -1 ;
   this.stop_flag = 0 ;
   this.curr_frame_idx = -1 ;
   this.dev_mode = _dev_mode === true ? 1 : safe_int( _dev_mode, 0 ) ;
   this.curr_family = "" ;
   this.action_frames = [] ;
   this.actions_dict = [ "blur", "change", "clean", "click", "dblclick",
                         "end", // demo end
                         "focus", "hide", "keydel", "keypress",
                         "fadein", "fadeout",
                         "mousedown", "mouseenter", "mousemove", "mouseover", "mouseout", "mouseup", // mouse events
                         "move", "nothing", "scroll",
                         "select", // entry inside a combo box
                         "show",
                         "start", // demo start
                         "toggle" ] ;

   if ( this.dev_mode )
   {
     $("<div ID=\"demon_dev_div\"></div>").appendTo("body");
     this.demon_div_coords = { wnd_w : $(window).width(), wnd_h : window.innerHeight, dev_w : 190, dev_h : 52 } ;
     $( "#demon_dev_div" ).css( "display", "none" );
     $( "#demon_dev_div" ).width( this.demon_div_coords.dev_w );
     $( "#demon_dev_div" ).height( this.demon_div_coords.dev_h );
     $( "#demon_dev_div" ).css( "left", "2px" );
     $( "#demon_dev_div" ).css( "top", ( this.demon_div_coords.wnd_h - this.demon_div_coords.dev_h - 22 )+"px" );
   }
}

demo_n.prototype.stop = function()
{
  if ( this.timeoutid > 0 )
  {
    clearTimeout( this.timeoutid );
    this.stop_flag = 1 ;
    $( "#demon_mark_div" ).html( "<SPAN STYLE=\"cursor:pointer;\" ONCLICK=\"javascript:_demon.resume();\">Resume demo</SPAN>" );
  }
}

demo_n.prototype.resume = function()
{
  this.stop_flag = 0 ;
  if ( this.curr_frame_idx >= 0 )
  {
    this.do_it( this.curr_frame_idx+1 );
    $( "#demon_mark_div" ).html( "Demo&nbsp;<SPAN STYLE=\"cursor:pointer;\" ONCLICK=\"javascript:_demon.stop();\">Stop</SPAN>" );
  }
}

demo_n.prototype.add = function( _json )
{
   _json.action = safe_string( _json.action, "" ).toLowerCase();
   _json.time = safe_float( _json.time, 0 ); if ( _json.time < 0 ) _json.time = 0 ;
   _json.time_unit = safe_string( _json.time_unit, "s" ).toLowerCase();
   _json.showlabel = _json.showlabel == null ? false : ( _json.showlabel ? true : false ) ;
   _json.desclabel = safe_string( _json.desclabel, "" ) ;
   _json.family = is_string( _json.family ) ? _json.family.trim() : this.curr_family ;

   var _mask = is_string( _json.ctrl_id ) ? 1 : 0 ;
       _mask |= _json.time > 0 ? 2 : 0 ;
       _mask |= is_string( _json.time_unit ) ? ( ( [ "m", "s", "ms" ] ).indexOf( _json.time_unit ) ? 4 : 0 ) : 0 ;
       _mask |= is_string( _json.action ) ? ( ( _json.action.length > 0 && this.actions_dict.indexOf( _json.action ) != -1 ) ? 8 : 0 ) : 0 ;

   var _skip_debug = _json.action == "start" || _json.action == "end" ? 1 : 0 ;
   if ( this.dev_mode && _mask != 15 && !_skip_debug )
   {
      if ( ( _mask & 1 ) == 0 ) console.log( "#DEMO-N : FAILED ADD #"+this.action_frames.length, "MISSING CTRL ID" );
      if ( ( _mask & 2 ) == 0 ) console.log( "#DEMO-N : FAILED ADD #"+this.action_frames.length, "MISSING TIME SIZE" );
      if ( ( _mask & 4 ) == 0 ) console.log( "#DEMO-N : FAILED ADD #"+this.action_frames.length, "MISSING TIME UNIT" );
      if ( ( _mask & 8 ) == 0 ) console.log( "#DEMO-N : FAILED ADD #"+this.action_frames.length, "MISSING OR INVALID ACTION" );
   }

   if ( _mask & 1 )
   {
      if ( _json.ctrl_id.charAt(0) == "#" ) _json.ctrl_id = _json.ctrl_id.substr( 1, _json.ctrl_id.length );
   }

   if ( _mask == 15 || _json.action == "start" || _json.action == "end" ) this.action_frames.push( _json );
   return this ; // it allows calls chain
}

demo_n.prototype.return_millisecs = function( _time_val, _time_measure )
{
   switch( _time_measure )
   {
      case "m": // minutes
      _time_val *= 1000 * 60 ;
      break ;
      case "s": // seconds
      _time_val *= 1000 ;
      break ;
      case "ms": // milliseconds
      default:
      // do nothing here
      break ;
   }
   return _time_val ;
}

demo_n.prototype.dev_div_show = function( _step )
{
   if ( this.dev_mode )
   {
     _step = safe_int( _step, 0 );
     if ( this.action_frames[ _step ] != null )
     {
       var _time = this.action_frames[ _step ].time + " " + this.action_frames[ _step ].time_unit ;
       $( "#demon_dev_div" ).html( "<SPAN STYLE=\"color:#5195DF;\">Developer mode</SPAN><br />Action <b>#"+_step + "&nbsp;:&nbsp;"+this.action_frames[ _step ].action+"</b><br />Duration time <b CLASS=\"dev_div\">" + _time + "</b>" );
     }
   }
}

demo_n.prototype.run = function( _family )
{
   if ( !is_string( _family ) ) _family = this.curr_family ;
   else this.curr_family = _family ;

   if ( this.action_frames.length == 0 ) return ;
   else if ( this.action_frames[ this.action_frames.length-1 ].action != "end" )
   this.add( { ctrl_id : "", time : this.action_frames[ this.action_frames.length-1 ].time, time_unit : this.action_frames[ this.action_frames.length-1 ].time_unit,
               action : "end", set_value : -1 } );

   var _frames = this.action_frames ;
   var _frames_n = _frames.length ;
   if ( _frames_n == 0 ) return ;
   var _i = 0, _time = 0, _entry = _frames[_i] ;
   var _demon = this ;

   if ( $( "#demon_cover_div" ).get(0) == null )
   {
     $( "<div ID=\"demon_cover_div\"></div>" ).appendTo("body");
     $( "#demon_cover_div" ).css( "left", 0 );
     $( "#demon_cover_div" ).css( "top", 0 );
     $( "#demon_cover_div" ).width( $(window).width()-1 );
     $( "#demon_cover_div" ).height( $(window).height()-1 );
     $( "#demon_cover_div" ).show();
   }

   if ( $( "#demon_mark_div" ).get(0) == null )
   {
     $("<div ID=\"demon_mark_div\"></div>").appendTo("body");
     this.demon_div_coords = { wnd_w : $(window).width(), wnd_h : window.innerHeight, dev_w : 270, dev_h : 52 } ;
     $( "#demon_dev_div" ).width( this.demon_div_coords.dev_w );
     $( "#demon_dev_div" ).height( this.demon_div_coords.dev_h );
     $( "#demon_mark_div" ).css( "left", $(window).width() - $( "#demon_mark_div" ).width() - 4 );
     $( "#demon_dev_div" ).css( "top", ( this.demon_div_coords.wnd_h - this.demon_div_coords.dev_h - 22 )+"px" );
   }

   if ( $( "#demon_div" ).get(0) == null ) $( "<div ID=\"demon_div\"></div>" ).appendTo("body");
   if ( $( "#demon_desc_div" ).get(0) == null )  $( "<div ID=\"demon_desc_div\"></div>" ).appendTo("body");
   if ( this.dev_mode ) $( "#demon_dev_div" ).css( "display", "block" );

   this.curr_frame_idx = _i ;
   this.timeoutid = setTimeout( function() { _demon.do_it( _i ) ; }, this.return_millisecs( _entry.time, _entry.time_unit ) );
}

demo_n.prototype.do_it = function( _i )
{
   this.curr_frame_idx = _i ;
   var _demon = this ;
   var _frames = this.action_frames ;
   var _frames_n = _frames.length ;
   var _entry = _frames[_i] ;
   if ( _entry == null ) return ;
   var _skip_match = _entry.action == "start" || _entry.action == "end" ;
   var _family_match = _skip_match || this.curr_family == _entry.family ;
   var _ctrl_exists = $( "#" + _entry.ctrl_id ).get(0) != null ? 1 : 0 ;

   if ( typeof _entry.pre_fn === "function" && _family_match ) _entry.pre_fn.apply();
   $( "#demon_mark_div" ).html( _i+" of "+_frames_n+" - Demo&nbsp;<SPAN STYLE=\"cursor:pointer;\" ONCLICK=\"javascript:_demon.stop();\">Stop</SPAN>" );

   var _type = "" ;
   if ( _ctrl_exists )
   {
     if ( $( "#" + _entry.ctrl_id ).is( "div" ) ) _type = "div" ;
     else if ( $( "#" + _entry.ctrl_id ).is( "td" ) ) _type = "td" ;
     else if ( $( "#" + _entry.ctrl_id ).is( "th" ) ) _type = "th" ;
     else if ( $( "#" + _entry.ctrl_id ).is( "img" ) ) _type = "img" ;
     else if ( $( "#" + _entry.ctrl_id ).is( "span" ) ) _type = "span" ;
     else _type = $( "#" + _entry.ctrl_id ).prop('type').toLowerCase() ;
   }

   if ( _entry.showlabel && _family_match ) // showlabel
   {
     if ( _ctrl_exists )
     {
       var _offset = $( "#" + _entry.ctrl_id ).offset() ;
       var _width = $( "#" + _entry.ctrl_id ).width(), _height = $( "#" + _entry.ctrl_id ).height() ;
       var _ext_left_w = 0, _ext_left_h = 0, _ext_right_w = 0, _ext_right_h = 0 ;
       var _desc_shift_x = 0, _desc_shift_y = 0 ;
       console.log( _entry.ctrl_id, _type, _offset );
       switch( _type )
       {
         case "button":
         _ext_left_w = -4, _ext_left_h = -4, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 22, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 12 ;
         break ;
         case "checkbox":
         case "radio":
         _ext_left_w = -4, _ext_left_h = -4, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 5, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 5 ;
         _desc_shift_y = _ext_right_h ;
         break ;
         case "select-one":
         _ext_left_w = -4, _ext_left_h = -4, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 8, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 8 ;
         break ;
         case "td":
         case "th":
         var _margin = safe_int( $( "#"+_entry.ctrl_id ).css( "margin" ), 0 ) ;
         var _padding = safe_int( $( "#"+_entry.ctrl_id ).css( "padding" ), 0 ) ;
         _ext_left_w = -2, _ext_left_h = -2, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 8 + _padding + _margin, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 8 + _padding + _margin ;
         break ;
         case "text":
         _ext_left_w = -4, _ext_left_h = -4, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 12, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 12 ;
         break ;
         case "img":
         case "textarea":
         _ext_left_w = -4, _ext_left_h = -4, _ext_right_w = $( "#" + _entry.ctrl_id ).width() + 18, _ext_right_h = $( "#" + _entry.ctrl_id ).height() + 18 ;
         break ;
         default: break ;
       }
                
       $( "#demon_div" ).css( "top", _offset.top + _ext_left_h );
       $( "#demon_div" ).css( "left", _offset.left + _ext_left_w );
       $( "#demon_div" ).width( _ext_right_w );
       $( "#demon_div" ).height( _ext_right_h );
       $( "#demon_div" ).show();
  
       var _x = _offset.left + _ext_left_w + 3 + $( "#demon_div" ).width() ;
       $( "#demon_desc_div" ).css( "top", _offset.top + _ext_left_h + _desc_shift_y );
       $( "#demon_desc_div" ).css( "left", _x + _desc_shift_x );
                
       if ( _entry.desclabel.length > 0 )
       {
         _entry.desclabel = _entry.desclabel.replace( /\r/g, "" ).replace( /\n/g, "<br/>" ) ;
         $( "#demon_desc_div" ).zIndex( Math.pow( 2, 31 ) );
         $( "#demon_desc_div" ).html( _entry.desclabel );
         $( "#demon_desc_div" ).show();
         var _cand_left = _offset.left ;
         var _full_left = _cand_left + $( "#demon_desc_div" ).width() + 3 + _ext_right_w ;
         if ( _full_left > $( window ).width() )
         $( "#demon_desc_div" ).css( "left", _cand_left - $( "#demon_desc_div" ).width() - 12 + _ext_left_w );
       }
       else $( "#demon_desc_div" ).hide();
     }
   }
   else { $( "#demon_div" ).hide(); $( "#demon_desc_div" ).html( "" ); $( "#demon_desc_div" ).hide(); }

   if ( _family_match )
   {
     switch( _entry.action )
     {
       case "clean":
       if ( _entry.set_value != null )
       {
         if ( _type == "td" || _type == "th" || _type == "div" )
         $( "#" + _entry.ctrl_id ).html( "" ) ;
         else $( "#" + _entry.ctrl_id ).val( "" ) ;
       }
       break ;
       case "blur":
       case "change":
       case "click":
       case "dblclick":
       case "focus":
       case "mousedown":
       case "mouseenter":
       case "mousemove":
       case "mouseover":
       case "mouseout":
       case "mouseup":
       $( "#" + _entry.ctrl_id ).trigger( _entry.action ) ;
       break ;
       case "end":
       if ( $( "#demon_div" ).get(0) != null )
       {
         $( "#demon_div" ).hide();
         $( "#demon_desc_div" ).hide();
         //$( "#demon_dev_div" ).hide();
         $( "#demon_mark_div" ).hide();
         $( "#demon_cover_div" ).hide();

         $( "#demon_div" ).remove();
         //$( "#demon_dev_div" ).remove();
         $( "#demon_desc_div" ).remove();
         $( "#demon_mark_div" ).remove();
         $( "#demon_cover_div" ).remove();
       }
       break ;
       case "fadein":
       if ( _entry.set_value != null )
       $( "#" + _entry.ctrl_id ).fadeIn( _entry.set_value ) ;
       else console.log( "#DEMO-N : required set_value attribute to let 'fadein' run" );
       break ;
       case "fadeout":
       if ( _entry.set_value != null )
       $( "#" + _entry.ctrl_id ).fadeOut( _entry.set_value, function(){ $( "#" + _entry.ctrl_id ).hide() ; } ) ;
       else console.log( "#DEMO-N : required set_value attribute to let 'fadeout' run" );
       break ;
       case "hide":
       $( "#" + _entry.ctrl_id ).hide() ;
       $( "#demon_desc_div" ).hide();
       break ;
       case "keypress":
       if ( _entry.set_value != null )
       {
         if ( _type == "td" || _type == "th" || _type == "div" )
         $( "#" + _entry.ctrl_id ).html( $( "#" + _entry.ctrl_id ).html() + _entry.set_value ) ;
         else $( "#" + _entry.ctrl_id ).val( $( "#" + _entry.ctrl_id ).val() + _entry.set_value ) ;
       }
       break ;
       case "keydel":
       if ( _entry.set_value != null )
       $( "#" + _entry.ctrl_id ).val( $( "#" + _entry.ctrl_id ).val().slice(0,-1) ) ;
       break ;
       case "move":
       if ( _entry.set_value != null && $( "#" + _entry.ctrl_id ).is( "div" ) )
       {
          if ( _entry.set_value.to_x != null && _entry.set_value.to_y != null )
          {
            var _to_x = is_string( _entry.set_value.to_x ) ? safe_string( _entry.set_value.to_x, "" ) : safe_int( _entry.set_value.to_x, -1 ) ;
            var _to_y = is_string( _entry.set_value.to_y ) ? safe_string( _entry.set_value.to_y, "" ) : safe_int( _entry.set_value.to_y, -1 ) ;
            switch( _to_x )
            {
               case "center": _to_x = ( $(window).width() - $( "#"+_entry.ctrl_id ).width() ) / 2 ; break ;
               case "left": _to_x = 0 ; break ;
               case "right": _to_x = $(window).width() - $( "#"+_entry.ctrl_id ).width() ; break ;
               default: break ;
            }

            switch( _to_y )
            {
              case "center": _to_y = ( $(window).height() - $( "#"+_entry.ctrl_id ).height() ) / 2 ; break ;
              case "top": _to_y = 0 ; break ;
              case "bottom": _to_y = $(window).height() - $( "#"+_entry.ctrl_id ).height() ; break ;
              default: break ;
            }

            $( "#" + _entry.ctrl_id ).animate({ 'left' : _to_x, 'top' : _to_y });
          }
          else if ( _entry.set_value.pos != null )
          {
            _entry.set_value.pos += "" ;
            switch( _entry.set_value.pos )
            {
              case "left":
              break
            }
          }
       }
       break ;
       case "scroll":
       if ( _entry.set_value != null && $( "#" + _entry.ctrl_id ).is( "div" ) )
       {
          if ( _entry.set_value.to_x != null && _entry.set_value.to_y != null )
          {
             var _to_x = safe_int( _entry.set_value.to_x, -1 ) ;
             var _to_y = safe_int( _entry.set_value.to_y, -1 ) ;
             $( "#" + _entry.ctrl_id ).scrollLeft( _to_x );
             $( "#" + _entry.ctrl_id ).scrollTop( _to_y );
          }
       }
       break ;
       case "select":
       if ( _entry.set_value != null )
       $( "#" + _entry.ctrl_id ).val( _entry.set_value ) ;
       else if ( _entry.set_text != null )
       $("#"+_entry.ctrl_id+" option:contains(" + _entry.set_text + ")").attr('selected', 'selected');

       $( "#" + _entry.ctrl_id ).trigger( "change" ) ;
       break ;
       case "show":
       $( "#" + _entry.ctrl_id ).show() ;
       break ;
       case "toggle":
       if ( _entry.set_value != null )
       $( "#" + _entry.ctrl_id ).toggle( _entry.set_value, function()
       {
         if( !( $( "#" + _entry.ctrl_id ).is( ":visible" ) ) ) $( "#" + _entry.ctrl_id ).hide();
       } ) ;
       break ;
       default: break ;
     }
   }

   if ( typeof _entry.post_fn === "function" && _family_match ) _entry.post_fn.apply();
   if ( _i < _frames_n )
   {
     if ( _family_match ) this.dev_div_show( _i );
     _entry = _frames[_i] ;
     if ( !this.stop_flag && _family_match ) this.timeoutid = setTimeout( function() { _demon.do_it( ++_i ) ; }, this.return_millisecs( _entry.time, _entry.time_unit ) );
     else _demon.do_it( ++_i ) ;
   }
}