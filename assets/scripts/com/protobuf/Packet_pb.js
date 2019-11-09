var jspbcomp = require('google-protobuf');
var COMPILED = jspbcomp.COMPILED;
var jspb = jspbcomp.jspb;
var goog = jspbcomp.goog;
var proto = {};
var global = Function('return this')();
goog.exportSymbol('proto.Packet', null, global);
proto.Packet = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.Packet, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.Packet.displayName = 'proto.Packet';
}
if (jspb.Message.GENERATE_TO_OBJECT) {
proto.Packet.prototype.toObject = function(opt_includeInstance) {
  return proto.Packet.toObject(opt_includeInstance, this);
};
proto.Packet.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getField(msg, 1),
    content: msg.getContent_asB64(),
    encrypt: jspb.Message.getField(msg, 3),
    encryptKey: jspb.Message.getField(msg, 4),
    version: jspb.Message.getField(msg, 5)
  };
  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}
proto.Packet.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Packet;
  return proto.Packet.deserializeBinaryFromReader(msg, reader);
};
proto.Packet.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value =  (reader.readInt32());
      msg.setType(value);
      break;
    case 2:
      var value =  (reader.readBytes());
      msg.setContent(value);
      break;
    case 3:
      var value =  (reader.readString());
      msg.setEncrypt(value);
      break;
    case 4:
      var value =  (reader.readString());
      msg.setEncryptKey(value);
      break;
    case 5:
      var value =  (reader.readInt32());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};
proto.Packet.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Packet.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};
proto.Packet.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f =  (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeInt32(
      1,
      f
    );
  }
  f =  (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeBytes(
      2,
      f
    );
  }
  f =  (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f =  (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeString(
      4,
      f
    );
  }
  f =  (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
};
proto.Packet.prototype.getType = function() {
  return  (jspb.Message.getFieldWithDefault(this, 1, 0));
};
proto.Packet.prototype.setType = function(value) {
  jspb.Message.setField(this, 1, value);
};
proto.Packet.prototype.getContent = function() {
  return  (jspb.Message.getFieldWithDefault(this, 2, ""));
};
proto.Packet.prototype.getContent_asB64 = function() {
  return  (jspb.Message.bytesAsB64(
      this.getContent()));
};
proto.Packet.prototype.getContent_asU8 = function() {
  return  (jspb.Message.bytesAsU8(
      this.getContent()));
};
proto.Packet.prototype.setContent = function(value) {
  jspb.Message.setField(this, 2, value);
};
proto.Packet.prototype.getEncrypt = function() {
  return  (jspb.Message.getFieldWithDefault(this, 3, ""));
};
proto.Packet.prototype.setEncrypt = function(value) {
  jspb.Message.setField(this, 3, value);
};
proto.Packet.prototype.getEncryptKey = function() {
  return  (jspb.Message.getFieldWithDefault(this, 4, ""));
};
proto.Packet.prototype.setEncryptKey = function(value) {
  jspb.Message.setField(this, 4, value);
};
proto.Packet.prototype.getVersion = function() {
  return  (jspb.Message.getFieldWithDefault(this, 5, 0));
};
proto.Packet.prototype.setVersion = function(value) {
  jspb.Message.setField(this, 5, value);
};
goog.object.extend(exports, proto);