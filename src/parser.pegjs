// Parser for the BVH file format
// Written by Casper Lamboo
// File format discription from
// https://research.cs.wisc.edu/graphics/Courses/cs-838-1999/Jeff/BVH.html

start = _ hierachy:Hierchy motion:Motion { return { hierachy, motion }; }

// hierachy can contain multiple roots (1 root for each tracked actor?)
// however this is not used in any of our example cases
// this parser just parses a single root
Hierchy = "HIERARCHY" _ root:Joint { return root; }

Joint = type:("ROOT" / "JOINT") _ name:String _ "{" _
  offset:Offset
  channels:Channels
  jointsOrEndSite:(EndSite / Joint*)
"}" _ {
  const data = { name, offset, channels };

  if (type === "ROOT") {
    data.type = options.ROOT_ID;
  } else if (type === "JOINT") {
    data.type = options.JOINT_ID;
  }

  // uugh
  if (Array.isArray(jointsOrEndSite)) {
    data.joints = jointsOrEndSite;
  } else {
    data.endSite = jointsOrEndSite;
  }

  return data;
}

EndSite = "End Site" _ "{" _
  offset:Offset _
"}" _ { return { offset } }

Offset   = "OFFSET" _ x:Float _ y:Float _ z:Float _ { return { x, y, z }; }
Channels = "CHANNELS" _ num:Integer _
  posX:"Xposition"? _ posY:"Yposition"? _ posZ:"Zposition"? _
  rotZ:"Zrotation"? _ rotX:"Xrotation"? _ rotY:"Yrotation"? _
  { return {
  	num,
    channels: [posX, posY, posZ, rotZ, rotX, rotY]
      .filter(name => name !== null)
      .map(name => options.CHANNEL_IDS[name])
      .reduce((a, b) => a | b, 0)
  };
}

// Motion parser
Motion = "MOTION" _ frames:Frames frameTime:FrameTime keyFrames:KeyFrames+ { return { frames, frameTime, keyFrames }; }

KeyFrames = keyFrames:KeyFrame+ _ { return keyFrames; }
KeyFrame  = [ \t]* keyFrame:Float [ \t]*   { return keyFrame; }

Frames    = "Frames:"     _ frames:Integer  _ { return frames; }
FrameTime = "Frame Time:" _ frameTime:Float _ { return frameTime; }

// Basic data types
String  = [a-zA-Z0-9_\-]+                          { return text(); }
Integer = [0-9]+                                   { return parseInt(text()); }
Float   = "-"? [0-9]+ "."? [0-9]* "e"? "-"? [0-9]* { return parseFloat(text()); }
_       = [ \t\n\r]* // whitespaces
