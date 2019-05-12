{
const { ROOT_ID, JOINT_ID, CHANNEL_IDS } = options;
}
// Parser for the BVH file format
// Written by Casper Lamboo
// File format discription from
// https://research.cs.wisc.edu/graphics/Courses/cs-838-1999/Jeff/BVH.html

start = _? hierachy:Hierchy _ motion:Motion _? { return { hierachy, motion }; }

// hierachy can contain multiple roots (1 root for each tracked actor?)
// however this is not used in any of our example cases
// this parser just parses a single root
Hierchy = "HIERARCHY" _ root:Joint { return root; }

Joint = type:("ROOT" / "JOINT") _ name:String _ "{" _
  offset:Offset _
  channels:Channels _
  jointsOrEndSite:(
    joints:((joint:Joint _ { return joint; })+) { return { joints }; } /
    endSite:EndSite _ { return { endSite }; }
  )
"}" {
  type = type === "ROOT" ? ROOT_ID : JOINT_ID;
  return { type, name, offset, channels, ...jointsOrEndSite };
}

EndSite = "End Site" _ "{" _
  offset:Offset _
"}" { return { offset } }

Offset   = "OFFSET" _ x:Float _ y:Float _ z:Float { return { x, y, z }; }
Channels = "CHANNELS" _ num:Integer _
  posX:"Xposition"? _ posY:"Yposition"? _ posZ:"Zposition"? _
  rotZ:"Zrotation"? _ rotX:"Xrotation"? _ rotY:"Yrotation"?
  { return {
    num,
    channels: [posX, posY, posZ, rotZ, rotX, rotY]
      .filter(name => name !== null)
      .map(name => CHANNEL_IDS[name])
      .reduce((a, b) => a | b, 0)
  };
}

// Motion parser
Motion = "MOTION" _ frames:Frames _ frameTime:FrameTime _ keyFrames:KeyFrames+ {
  return { frames, frameTime, keyFrames };
}

KeyFrames = [ \t]* keyFrames:KeyFrame+ [\n\r]+ { return keyFrames; }
KeyFrame  = keyFrame:Float [ \t]+              { return keyFrame; }

Frames    = "Frames:"     _ frames:Integer  { return frames; }
FrameTime = "Frame Time:" _ frameTime:Float { return frameTime; }

// Basic data types
String  = [a-zA-Z0-9_\-]+                          { return text(); }
Integer = [0-9]+                                   { return parseInt(text()); }
Float   = "-"? [0-9]+ "."? [0-9]* "e"? "-"? [0-9]* { return parseFloat(text()); }
_       = [ \t\n\r]+ // whitespaces
